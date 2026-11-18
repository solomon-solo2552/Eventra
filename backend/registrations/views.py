from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Registration
from .serializers import RegistrationSerializer
from .services import register_for_event, cancel_registration


class CreateRegistrationView(APIView):
    """POST /api/registrations/  body: { ticket_type_id: int }"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        ticket_type_id = request.data.get("ticket_type_id")
        if not ticket_type_id:
            return Response(
                {"detail": "ticket_type_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        reg = register_for_event(user=request.user, ticket_type_id=int(ticket_type_id))
        return Response(
            RegistrationSerializer(reg).data,
            status=status.HTTP_201_CREATED,
        )


class MyRegistrationsView(generics.ListAPIView):
    """GET /api/registrations/me/"""

    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Registration.objects.filter(user=self.request.user).select_related(
            "event", "ticket_type"
        )


class CancelRegistrationView(APIView):
    """POST /api/registrations/:id/cancel/"""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk: int):
        try:
            reg = Registration.objects.get(pk=pk, user=request.user)
        except Registration.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        cancel_registration(registration=reg)
        return Response(RegistrationSerializer(reg).data)
