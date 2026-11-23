import api from "./api";

export async function checkInTicket(ticketCode: string) {
    const { data } = await api.post("/organizer/checkin/", { ticket_code: ticketCode });
    return data as {
        detail: string;
        attendee?: string;
        ticket_code?: string;
        checked_in_at?: string;
    };
}