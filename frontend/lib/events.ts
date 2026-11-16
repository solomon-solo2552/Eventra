import api from "./api";
import { Event, Paginated } from "@/types";

export async function fetchEvents(params: Record<string, string> = {}) {
    const { data } = await api.get<Paginated<Event>>("/events/", { params });
    return data;
}

export async function fetchEvent(id: number | string) {
    const { data } = await api.get<Event>(`/events/${id}/`);
    return data;
}

export async function createEvent(payload: Partial<Event>) {
    const { data } = await api.post<Event>("/events/", payload);
    return data;
}

export async function updateEvent(id: number | string, payload: Partial<Event>) {
    const { data } = await api.put<Event>(`/events/${id}/`, payload);
    return data;
}

export async function deleteEvent(id: number | string) {
    await api.delete(`/events/${id}/`);
}