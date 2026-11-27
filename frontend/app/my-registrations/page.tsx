"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cancelRegistration, fetchMyRegistrations } from "@/lib/registrations";
import { Registration } from "@/types";
import { RequireRole } from "@/components/auth/RequireRole";

function MyRegistrationsInner() {
    const [regs, setRegs] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function load() {
        try {
            setRegs(await fetchMyRegistrations());
        } catch {
            setError("Could not load your registrations.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleCancel(id: number) {
        if (!confirm("Cancel this registration?")) return;
        await cancelRegistration(id);
        load();
    }

    if (loading) return <main className="p-8">Loading...</main>;
    if (error) return <main className="p-8 text-red-500">{error}</main>;

    return (
        <main className="max-w-4xl mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-bold">My Registrations</h1>

            {regs.length === 0 ? (
                <p className="text-gray-500">
                    No registrations yet.{" "}
                    <Link href="/events" className="text-blue-600">
                        Browse events →
                    </Link>
                </p>
            ) : (
                <div className="space-y-3">
                    {regs.map((r) => (
                        <div key={r.id} className="border p-4 rounded flex justify-between gap-4">
                            <div className="space-y-1">
                                <Link
                                    href={`/events/${r.event}`}
                                    className="font-semibold hover:underline"
                                >
                                    {r.event_title}
                                </Link>
                                <p className="text-sm text-gray-500">
                                    {r.ticket_name} •{" "}
                                    {Number(r.ticket_price) === 0 ? "Free" : `₹${r.ticket_price}`}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {new Date(r.event_start_at).toLocaleString()} • {r.event_venue}
                                </p>
                                <p
                                    className={`text-xs font-medium ${r.status === "confirmed" ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {r.status.toUpperCase()}
                                </p>
                            </div>

                            {r.status === "confirmed" && (
                                <div className="flex flex-col gap-2 items-end">
                                    <Link
                                        href={`/tickets/${r.id}`}
                                        className="bg-blue-600 text-white text-sm px-3 py-1 rounded"
                                    >
                                        View Ticket
                                    </Link>
                                    <button
                                        onClick={() => handleCancel(r.id)}
                                        className="text-red-600 text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

export default function MyRegistrationsPage() {
    return (
        <RequireRole role="attendee">
            <MyRegistrationsInner />
        </RequireRole>
    )
}