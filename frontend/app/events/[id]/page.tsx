"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchEvent } from "@/lib/events";
import { Event } from "@/types";

export default function EventDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchEvent(id)
            .then(setEvent)
            .catch(() => setError("Event not found or not yet published."));
    }, [id]);

    if (error) return <main className="p-8 text-red-500">{error}</main>;
    if (!event) return <main className="p-8">Loading...</main>;

    return (
        <main className="max-w-4xl mx-auto p-6 space-y-6">
            <div>
                <p className="text-xs uppercase text-blue-600">{event.category || "General"}</p>
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <p className="text-gray-500 mt-1">
                    Hosted by <strong>{event.organizer_name}</strong>
                </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="border p-4 rounded">
                    <p className="text-gray-500">When</p>
                    <p>{new Date(event.start_at).toLocaleString()}</p>
                    <p>to {new Date(event.end_at).toLocaleString()}</p>
                </div>
                <div className="border p-4 rounded">
                    <p className="text-gray-500">Where</p>
                    <p>{event.venue}</p>
                </div>
            </div>

            <p className="whitespace-pre-line">{event.description}</p>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Tickets</h2>
                {event.ticket_types.length === 0 && (
                    <p className="text-gray-500">No ticket types available yet.</p>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                    {event.ticket_types.map((t) => (
                        <div key={t.id} className="border p-4 rounded space-y-1">
                            <div className="flex justify-between">
                                <strong>{t.name}</strong>
                                <span>{Number(t.price) === 0 ? "Free" : `₹${t.price}`}</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                {t.seats_left} / {t.capacity} seats left
                            </p>
                            <button
                                disabled={t.seats_left === 0}
                                className="w-full mt-2 bg-blue-600 text-white py-2 rounded disabled:bg-gray-300"
                                onClick={() => alert("Booking lands tomorrow (Day 3)")}
                            >
                                {t.seats_left === 0 ? "Sold out" : "Register"}
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}