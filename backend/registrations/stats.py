from django.db.models import Count, Sum, Q
from events.models import Event
from .models import Registration


def organizer_stats(organizer):
    events = Event.objects.filter(organizer=organizer)
    event_ids = events.values_list("id", flat=True)

    regs = Registration.objects.filter(event_id__in=event_ids)

    total_registrations = regs.filter(status=Registration.Status.CONFIRMED).count()
    checked_in = regs.filter(
        status=Registration.Status.CONFIRMED, checked_in_at__isnull=False
    ).count()
    cancelled = regs.filter(status=Registration.Status.CANCELLED).count()

    revenue = (
        regs.filter(status=Registration.Status.CONFIRMED).aggregate(
            total=Sum("ticket_type__price")
        )["total"]
        or 0
    )

    check_in_rate = (
        (checked_in / total_registrations * 100) if total_registrations else 0
    )

    # Top 5 events by confirmed registrations
    top_events = (
        events.annotate(
            confirmed_count=Count(
                "registrations",
                filter=Q(registrations__status=Registration.Status.CONFIRMED),
            )
        )
        .order_by("-confirmed_count")
        .values("id", "title", "confirmed_count")[:5]
    )

    return {
        "total_events": events.count(),
        "published_events": events.filter(status=Event.Status.PUBLISHED).count(),
        "total_registrations": total_registrations,
        "checked_in": checked_in,
        "cancelled": cancelled,
        "revenue": float(revenue),
        "check_in_rate": round(check_in_rate, 1),
        "top_events": list(top_events),
    }
