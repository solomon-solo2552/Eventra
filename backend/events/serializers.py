from rest_framework import serializers
from .models import Event, TicketType

class TicketTypeSerializer(serializers.ModelSerializer):
    seats_left = serializers.ReadOnlyField()

    class Meta:
        model = TicketType
        fields = ("id", "name", "price", "capacity", "sold_count", "seats_left")
        read_only_fields = ("sold_count",)

class EventSerializer(serializers.ModelSerializer):
    ticket_types = TicketTypeSerializer(many=True, required=False)
    organizer_name = serializers.CharField(source="organizer.full_name", read_only=True)

    class Meta:
        model =Event
        fields = (
            "id", "organizer", "organizer_name", "title", "description",
            "venue", "category", "banner_url", "start_at", "end_at",
            "status", "ticket_types", "created_at",
        )
        read_only_fields = ("organizer", "created_at")

    def validate(self, data):
        start = data.get("start_at", getattr(self.instance, "start_at", None))
        end = data.get("end_at", getattr(self.instance, "end_at", None))
        if start and end and end <= start:
            raise serializers.ValidationError("end_at must be after start_at")
        return data

    def create(self, validated_data):
        ticket_types = validated_data.pop("ticket_types", [])
        event = Event.objects.create(**validated_data)
        for tt in ticket_types:
            TicketType.objects.create(event=event, **tt)
        return event

    def update(self, instance, validated_data):
        ticket_types = validated_data.pop("ticket_types", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if ticket_types is not None:
            # Simplest approach: delete & recreate tiers (fine until Day 3 introduces registrations)
            instance.ticket_types.all().delete()
            for tt in ticket_types:
                TicketType.objects.create(event=instance, **tt)
        return instance