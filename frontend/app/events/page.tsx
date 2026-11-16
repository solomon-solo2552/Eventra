"use client";

import { useEffect, useState } from "react";
import { fetchEvents } from "@/lib/events";
import { Event } from "@/types";
import { EventCard } from "@/components/events/EventCard";

const CATEGORIES = ["", "Tech", "Music", "Business", "Sports", "Arts"];

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (category) params.category = category;
        fetchEvents(params)
            .then((data) => setEvents(data.results))
            .finally(() => setLoading(false));
    }, [search, category]);

    return (
        <main className="max-w-6xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Discover Events</h1>

            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Search by title, venue, description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded p-2 flex-1"
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border rounded p-2"
                >
                    <option value="">All categories</option>
                    {CATEGORIES.filter(Boolean).map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : events.length === 0 ? (
                <p className="text-gray-500">No events found.</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </main>
    );
}