"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchEvent, updateEvent } from "@/lib/events";
import { EventForm } from "@/components/events/EventForm";
import { Event } from "@/types";

export function EditEventContent() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);

    useEffect(() => { fetchEvent(id).then(setEvent); }, [id]);

    if (!event) return <main className="p-8">Loading...</main>;

    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
            <EventForm
                initial={event}
                submitLabel="Save changes"
                onSubmit={async (payload) => {
                    await updateEvent(id, payload);
                    router.push("/organizer/events");
                }}
            />
        </main>
    );
}