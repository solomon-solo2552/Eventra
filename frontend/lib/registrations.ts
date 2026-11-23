import api from "./api";
import { Registration } from "@/types";

export async function registerForEvent(ticketTypeId: number): Promise<Registration> {
    const { data } = await api.post<Registration>("/registrations/", {
        ticket_type_id: ticketTypeId,
    });
    return data;
}

export async function fetchMyRegistrations(): Promise<Registration[]> {
    const { data } = await api.get<Registration[]>("/registrations/me/");
    return data;
}

export async function cancelRegistration(id: number): Promise<Registration> {
    const { data } = await api.post<Registration>(`/registrations/${id}/cancel/`);
    return data;
}