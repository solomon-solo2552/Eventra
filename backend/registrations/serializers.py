from rest_framework import serializers
from .models import Registration


class RegistrationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    event_start_at = serializers.DateTimeField(source="event.start_at", read_only=True)
    event_venue = serializers.CharField(source="event.venue", read_only=True)
    ticket_name = serializers.CharField(source="ticket_type.name", read_only=True)
    ticket_price = serializers.DecimalField(
        source="ticket_type.price", max_digits=8, decimal_places=2, read_only=True
    )
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = Registration
        fields = (
            "id",
            "event",
            "event_title",
            "event_start_at",
            "event_venue",
            "ticket_type",
            "ticket_name",
            "ticket_price",
            "status",
            "ticket_code",
            "qr_code_url",
            "checked_in_at",
            "created_at",
        )
        read_only_fields = (
            "id",
            "event",
            "ticket_type",
            "status",
            "ticket_code",
            "qr_code_url",
            "checked_in_at",
            "created_at",
        )

        def get_qr_code_url(self, obj):
            if not obj.qr_code:
                return None
            request = self.context.get("request")
            url = obj.qr_code.url
            return request.build_absolute_uri(url) if request else url
