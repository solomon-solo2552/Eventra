from django.db import transaction, IntegrityError
from rest_framework.exceptions import ValidationError
from events.models import TicketType
from .models import Registration


class SeatsUnavailable(ValidationError):
    default_detail = "No seats left for this ticket type."


class AlreadyRegistered(ValidationError):
    default_detail = "You already have an active registration for this event."


@transaction.atomic
def register_for_event(*, user, ticket_type_id: int) -> Registration:
    """
    Atomically reserve a seat and create a registration.
    The `SELECT ... FOR UPDATE` row-lock ensures two concurrent
    requests can never oversell the last seat.
    """
    try:
        # 1) Lock the tier row for the duration of this transaction.
        ticket_type = (
            TicketType.objects.select_for_update()
            .select_related("event")
            .get(pk=ticket_type_id)
        )
    except TicketType.DoesNotExist:
        raise ValidationError("Ticket type not found.")

    # 2) Guard against sold-out.
    if ticket_type.sold_count >= ticket_type.capacity:
        raise SeatsUnavailable()

    # 3) Guard against duplicate active registration.
    #    The DB constraint is the ultimate safety net; this is for a nice error.
    if Registration.objects.filter(
        user=user, event=ticket_type.event, status=Registration.Status.CONFIRMED
    ).exists():
        raise AlreadyRegistered()

    # 4) Reserve the seat and create the registration.
    ticket_type.sold_count += 1
    ticket_type.save(update_fields=["sold_count"])

    try:
        reg = Registration.objects.create(
            user=user,
            event=ticket_type.event,
            ticket_type=ticket_type,
        )
    except IntegrityError:
        # Fallback if the partial unique constraint fired (race condition).
        raise AlreadyRegistered()

    return reg


@transaction.atomic
def cancel_registration(*, registration: Registration) -> None:
    """
    Cancel a registration and free the seat, atomically.
    """
    if registration.status == Registration.Status.CANCELLED:
        return

    # Lock the tier row before decrementing.
    ticket_type = TicketType.objects.select_for_update().get(
        pk=registration.ticket_type_id
    )

    registration.status = Registration.Status.CANCELLED
    registration.save(update_fields=["status"])

    if ticket_type.sold_count > 0:
        ticket_type.sold_count -= 1
        ticket_type.save(update_fields=["sold_count"])
