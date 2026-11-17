"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchEvents } from "@/lib/events";
import { Event } from "@/types";
import { EventCard } from "@/components/events/EventCard";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetchEvents()
      .then((data) => setEvents(data.results.slice(0, 6)))
      .finally(() => setEventsLoading(false));
  }, []);

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Hero + auth bar */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Eventra</h1>
        <p className="text-gray-600 text-lg">Discover. Book. Experience.</p>

        {user ? (
          <div className="flex items-center gap-4">
            <p>Welcome, <strong>{user.full_name}</strong> ({user.role})</p>
            <button onClick={logout} className="bg-gray-200 px-4 py-2 rounded">
              Logout
            </button>
          </div>
        ) : (
          <div className="space-x-3">
            <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded inline-block">
              Login
            </Link>
            <Link href="/register" className="bg-gray-200 px-4 py-2 rounded inline-block">
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Upcoming events preview */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Upcoming Events</h2>
          <Link href="/events" className="text-blue-600 text-sm">
            View all →
          </Link>
        </div>

        {eventsLoading ? (
          <p className="text-gray-500">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500">
            No published events yet.{" "}
            {user?.role === "organizer" && (
              <Link href="/organizer/events/new" className="text-blue-600">
                Create one →
              </Link>
            )}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}