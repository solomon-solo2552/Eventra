"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Attendee, attendeesCsvUrl, fetchEventAttendees } from "@/lib/organizer";

function AttendeesContent() {
    const { id } = useParams<{ id: string }>();
    const [rows, setRows] = useState<Attendee[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEventAttendees(id)
            .then(setRows)
            .catch(() => setError("Could not load attendees."))
            .finally(() => setLoading(false));
    }, [id]);

    if (error) return <main className="p-8 text-red-500">{error}</main>;
    if (loading) return <main className="p-8">Loading...</main>;

    return (
        <main className="max-w-5xl mx-auto p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Attendees</h1>
                <Link
                    href={attendeesCsvUrl(id)}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm"
                >
                    Export CSV
                </Link>
            </div>

            {rows.length === 0 ? (
                <p className="text-gray-500">No attendees yet.</p>
            ) : (
                <div className="overflow-x-auto border rounded">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-2">Name</th>
                                <th className="text-left p-2">Email</th>
                                <th className="text-left p-2">Ticket</th>
                                <th className="text-left p-2">Price</th>
                                <th className="text-left p-2">Checked In</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={r.id} className="border-t">
                                    <td className="p-2">{r.attendee}</td>
                                    <td className="p-2">{r.email}</td>
                                    <td className="p-2">{r.ticket}</td>
                                    <td className="p-2">₹{r.price}</td>
                                    <td className="p-2">
                                        {r.checked_in_at
                                            ? new Date(r.checked_in_at).toLocaleString()
                                            : <span className="text-gray-400">—</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}

export default function AttendeesPage() {
    return (
        <Suspense fallback={<main className="p-8">Loading...</main>}>
            <AttendeesContent />
        </Suspense>
    );
}