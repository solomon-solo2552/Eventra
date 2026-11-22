from django.urls import path
from .views import (
    CreateRegistrationView,
    MyRegistrationsView,
    CancelRegistrationView,
    TicketView,
)

urlpatterns = [
    path("", CreateRegistrationView.as_view(), name="register-for-event"),
    path("me/", MyRegistrationsView.as_view(), name="my-registrations"),
    path(
        "<int:pk>/cancel/", CancelRegistrationView.as_view(), name="cancel-registration"
    ),
    path("<int:pk>/ticket/", TicketView.as_view(), name="registration-ticket"),
]

# Organizer sub-router
from django.urls import path as _p
from .views import CheckInView

organizer_urlpatterns = [
    path("checkin/", CheckInView.as_view(), name="organizer-checkin"),
]
