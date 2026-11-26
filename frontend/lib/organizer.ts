import api from "./api";

export type OrganizerStats = {
    total_events: number;
    published_events: number;
    total_registrations: number;
    checked_in: number;
    cancelled: number;
    revenue: number;
    check_in_rate: number;
    top_events: { id: number; title: string; confirmed_count: number }[];
};

export async function fetchOrganizerStats() {
    const { data } = await api.get<OrganizerStats>("/organizer/stats/");
    return data;
}

export type Attendee = {
    id: number;
    attendee: string;
    email: string;
    ticket: string;
    price: string;
    ticket_code: string;
    checked_in_at: string | null;
    registered_at: string;
};

export async function fetchEventAttendees(eventId: number | string) {
    const { data } = await api.get<Attendee[]>(`/organizer/events/${eventId}/attendees/`);
    return data;
}

export function attendeesCsvUrl(eventId: number | string) {
    return `${process.env.NEXT_PUBLIC_API_URL}/organizer/events/${eventId}/attendees.csv`;
}