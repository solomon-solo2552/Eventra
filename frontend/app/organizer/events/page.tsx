"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchEvents, deleteEvent } from "@/lib/events";
import { Event } from "@/types";

export default function OrganizerEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);

    async function load() {
        const data = await fetchEvents();
        setEvents(data.results);
    }

    useEffect(() => { load(); }, []);

    async function handleDelete(id: number) {
        if (!confirm("Delete this event?")) return;
        await deleteEvent(id);
        load();
    }

    return (
        <main className="max-w-5xl mx-auto p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Events</h1>
                <Link
                    href="/organizer/events/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    + New Event
                </Link>
            </div>

            {events.length === 0 ? (
                <p className="text-gray-500">No events yet. Create your first one.</p>
            ) : (
                <div className="space-y-2">
                    {events.map((e) => (
                        <div key={e.id} className="border p-4 rounded flex justify-between items-center">
                            <div>
                                <p className="font-medium">{e.title}</p>
                                <p className="text-sm text-gray-500">
                                    {e.status} • {new Date(e.start_at).toLocaleDateString()} • {e.venue}
                                </p>
                            </div>
                            <div className="space-x-2">
                                <Link
                                    href={`/organizer/events/${e.id}/edit`}
                                    className="text-blue-600"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(e.id)}
                                    className="text-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}