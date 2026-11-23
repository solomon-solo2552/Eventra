from django.contrib.auth import get_user_model
from django.db import connections
from django.test import TransactionTestCase
from rest_framework.exceptions import ValidationError
from rest_framework.test import APIClient

from events.models import Event, TicketType
from .models import Registration
from .services import register_for_event

User = get_user_model()


class SeatLockingTests(TransactionTestCase):
    """
    TransactionTestCase is required here because we need real commits
    and separate DB connections to exercise SELECT ... FOR UPDATE.
    """

    def setUp(self):
        self.organizer = User.objects.create_user(
            email="org@eventra.dev", full_name="Org", password="pw", role="organizer"
        )
        self.event = Event.objects.create(
            organizer=self.organizer,
            title="Test Event",
            venue="Test Venue",
            start_at="2030-01-01T10:00:00Z",
            end_at="2030-01-01T12:00:00Z",
            status=Event.Status.PUBLISHED,
        )
        self.tier = TicketType.objects.create(
            event=self.event, name="Last Seat", price="10.00", capacity=1
        )
        self.alice = User.objects.create_user(
            email="alice@eventra.dev", full_name="Alice", password="pw"
        )
        self.bob = User.objects.create_user(
            email="bob@eventra.dev", full_name="Bob", password="pw"
        )

    def test_last_seat_only_one_wins(self):
        from concurrent.futures import ThreadPoolExecutor

        def attempt(user):
            try:
                # Each thread must close its DB connection afterwards.
                register_for_event(user=user, ticket_type_id=self.tier.id)
                return "ok"
            except ValidationError:
                return "rejected"
            finally:
                connections.close_all()

        with ThreadPoolExecutor(max_workers=2) as ex:
            results = list(ex.map(attempt, [self.alice, self.bob]))

        self.assertEqual(sorted(results), ["ok", "rejected"])
        self.assertEqual(Registration.objects.count(), 1)
        self.tier.refresh_from_db()
        self.assertEqual(self.tier.sold_count, 1)

    def test_duplicate_active_registration_blocked(self):
        register_for_event(user=self.alice, ticket_type_id=self.tier.id)
        with self.assertRaises(ValidationError):
            register_for_event(user=self.alice, ticket_type_id=self.tier.id)

    def test_cancel_frees_seat(self):
        reg = register_for_event(user=self.alice, ticket_type_id=self.tier.id)
        from .services import cancel_registration

        cancel_registration(registration=reg)
        self.tier.refresh_from_db()
        self.assertEqual(self.tier.sold_count, 0)
        # Bob can now register for the freed seat.
        register_for_event(user=self.bob, ticket_type_id=self.tier.id)
        self.tier.refresh_from_db()
        self.assertEqual(self.tier.sold_count, 1)


class CheckInApiTests(TransactionTestCase):
    def setUp(self):
        self.org = User.objects.create_user(
            email="org@eventra.dev", full_name="Org", password="pw", role="organizer"
        )
        self.attendee = User.objects.create_user(
            email="a@eventra.dev", full_name="Alice", password="pw"
        )
        self.event = Event.objects.create(
            organizer=self.org,
            title="T",
            venue="V",
            start_at="2030-01-01T10:00:00Z",
            end_at="2030-01-01T12:00:00Z",
            status=Event.Status.PUBLISHED,
        )
        self.tier = TicketType.objects.create(
            event=self.event, name="GA", price="0.00", capacity=10
        )
        self.reg = register_for_event(user=self.attendee, ticket_type_id=self.tier.id)

    def test_check_in_idempotent(self):
        client = APIClient()
        client.force_authenticate(user=self.org)
        r1 = client.post(
            "/api/organizer/checkin/",
            {"ticket_code": str(self.reg.ticket_code)},
            format="json",
        )
        r2 = client.post(
            "/api/organizer/checkin/",
            {"ticket_code": str(self.reg.ticket_code)},
            format="json",
        )
        assert r1.status_code == 200 and r1.data["detail"] == "Checked in."
        assert r2.status_code == 200 and r2.data["detail"] == "Already checked in."

    def test_cannot_check_in_others_ticket(self):
        other_org = User.objects.create_user(
            email="other@eventra.dev",
            full_name="Other",
            password="pw",
            role="organizer",
        )
        client = APIClient()
        client.force_authenticate(user=other_org)
        r = client.post(
            "/api/organizer/checkin/",
            {"ticket_code": str(self.reg.ticket_code)},
            format="json",
        )
        assert r.status_code == 404
