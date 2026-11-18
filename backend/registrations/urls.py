from django.urls import path
from .views import (
    CreateRegistrationView,
    MyRegistrationsView,
    CancelRegistrationView,
)

urlpatterns = [
    path("", CreateRegistrationView.as_view(), name="register-for-event"),
    path("me/", MyRegistrationsView.as_view(), name="my-registrations"),
    path(
        "<int:pk>/cancel/", CancelRegistrationView.as_view(), name="cancel-registration"
    ),
]
