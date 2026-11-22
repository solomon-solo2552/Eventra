import io

import qrcode
from django.core.files.base import ContentFile


def build_ticket_qr(
    registration, base_url: str = "http://localhost:3000"
) -> ContentFile:
    """
    Build a QR PNG for registration. The QR payload is a URL that
    a scanner can open - the organizer check-in page reads ?code=...
    from the query string and marks the ticket as checked-in.
    """
    checkin_url = f"{base_url}/organizer/checkin?code={registration.ticket_code}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(checkin_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return ContentFile(buf.read(), name=f"ticket_{registration.ticket_code}.png")
