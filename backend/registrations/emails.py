from django.conf import settings
from django.core.mail import send_mail


def send_confirmation_email(registration):
    subject = f"Your ticket for {registration.event.title}"
    message = (
        f"Hi {registration.user.full_name},\n\n"
        f"You're confirmed for {registration.event.title}.\n"
        f"Venue: {registration.event.venue}\n"
        f"Start: {registration.event.start_at:%Y-%m-%d %H:%M}\n"
        f"Ticket: {registration.ticket_type.name}\n"
        f"Ticket code: {registration.ticket_code}\n\n"
        f"Your QR ticket is attached to your Eventra account.\n"
        f"See you there!\n\n— Eventra"
    )
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [registration.user.email],
        fail_silently=True,
    )
