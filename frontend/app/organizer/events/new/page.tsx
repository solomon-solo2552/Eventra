"use client";

import { useRouter } from "next/navigation";
import { createEvent } from "@/lib/events";
import { EventForm } from "@/components/events/EventForm";
import { RequireRole } from "@/components/auth/RequireRole";

function NewEventInner() {
    const router = useRouter();
    return (
        <main className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Create Event</h1>
            <EventForm
                submitLabel="Create"
                onSubmit={async (payload) => {
                    await createEvent(payload);
                    router.push("/organizer/events");
                }}
            />
        </main>
    );
}

export default function NewEventPage() {
    return (
        <RequireRole role="organizer">
            <NewEventPage />
        </RequireRole>
    )
}