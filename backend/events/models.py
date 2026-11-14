from django.conf import settings
from django.db import models

# Create your models here.

class Event(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        CANCELLED = "cancelled", "Cancelled"

    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="events",
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    venue = models.CharField(max_length=255)
    category = models.CharField(max_length=80, blank=True)
    banner_url = models.URLField(blank=True)
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_at"]

    def __str__(self):
        return self.title

class TicketType(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="ticket_types")
    name = models.CharField(max_length=80)            # e.g.  "General", "VIP"
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    capacity = models.PositiveIntegerField()
    sold_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["price"]

    def __str__(self):
        return f"{self.event.title} — {self.name}"

    @property
    def seats_left(self):
        return max(self.capacity - self.sold_count, 0)