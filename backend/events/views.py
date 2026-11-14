from rest_framework import viewsets, filters, permissions
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from .models import Event
from .serializers import EventSerializer
from .permissions import IsOrganizerOrReadOnly


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOrganizerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "status"]
    search_fields = ["title", "description", "venue"]
    ordering_fields = ["start_at", "created_at"]

    def get_queryset(self):
        qs = Event.objects.select_related("organizer").prefetch_related("ticket_types")
        # Public only sees published events (unless it's their own — handled via /my-events)
        if self.action in ("list", "retrieve"):
            if self.request.user.is_authenticated and self.request.user.role == "organizer":
                return qs
            return qs.filter(status=Event.Status.PUBLISHED)
        return qs

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)