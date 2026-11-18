import uuid
from django.conf import settings
from django.db import models
from events.models import Event, TicketType


class Registration(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="registrations",
    )
    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="registrations"
    )
    ticket_type = models.ForeignKey(
        TicketType, on_delete=models.PROTECT, related_name="registrations"
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.CONFIRMED
    )
    ticket_code = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    checked_in_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "event"],
                condition=models.Q(status="confirmed"),
                name="unique_active_registration_per_user_event",
            )
        ]

    def __str__(self):
        return f"{self.user.email} → {self.event.title} ({self.ticket_type.name})"