from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from django.utils import timezone

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
            RegistrationSerializer(reg, context={"request": request}).data,
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

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx


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


class TicketView(APIView):
    """GET /api/registrations/:id/ticket/ — returns the raw PNG for the ticket QR."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int):
        from django.http import FileResponse

        try:
            reg = Registration.objects.get(pk=pk, user=request.user)
        except Registration.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        if not reg.qr_code:
            return Response(
                {"detail": "No QR available."}, status=status.HTTP_404_NOT_FOUND
            )
        return FileResponse(reg.qr_code.open("rb"), content_type="image/png")


class CheckInView(APIView):
    """POST /api/organizer/checkin/  body: { ticket_code: uuid }"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "organizer":
            return Response(
                {"detail": "Organizer only."}, status=status.HTTP_403_FORBIDDEN
            )

        code = (request.data.get("ticket_code") or "").strip()
        if not code:
            return Response(
                {"detail": "ticket_code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reg = Registration.objects.select_related(
                "event", "ticket_type", "user"
            ).get(
                ticket_code=code,
                event__organizer=request.user,
            )
        except Registration.DoesNotExist:
            return Response(
                {"detail": "Ticket not found for your events."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if reg.status != Registration.Status.CONFIRMED:
            return Response(
                {"detail": "Ticket is cancelled."}, status=status.HTTP_400_BAD_REQUEST
            )

        if reg.checked_in_at:
            return Response(
                {
                    "detail": "Already checked in.",
                    "checked_in_at": reg.checked_in_at,
                    "attendee": reg.user.full_name,
                },
                status=status.HTTP_200_OK,
            )

        reg.checked_in_at = timezone.now()
        reg.save(update_fields=["checked_in_at"])
        return Response(
            {
                "detail": "Checked in.",
                "attendee": reg.user.full_name,
                "ticket_code": str(reg.ticket_code),
                "checked_in_at": reg.checked_in_at,
            }
        )
