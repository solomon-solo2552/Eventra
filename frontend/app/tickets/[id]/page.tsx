"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Registration } from "@/types";
import { RequireRole } from "@/components/auth/RequireRole";

function TicketContent() {
    const { id } = useParams<{ id: string }>();
    const [reg, setReg] = useState<Registration | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get<Registration[]>("/registrations/me/")
            .then(({ data }) => {
                const found = data.find((r) => String(r.id) === id);
                if (found) setReg(found);
                else setError("Ticket not found.");
            })
            .catch(() => setError("Could not load ticket."));
    }, [id]);

    if (error) return <main className="p-8 text-red-500">{error}</main>;
    if (!reg) return <main className="p-8">Loading...</main>;

    return (
        <main className="max-w-lg mx-auto p-6 space-y-6">
            <div className="border rounded-lg p-6 space-y-4 text-center">
                <h1 className="text-xl font-bold">{reg.event_title}</h1>
                <p className="text-gray-500 text-sm">
                    {new Date(reg.event_start_at).toLocaleString()} • {reg.event_venue}
                </p>
                <p className="text-sm">
                    <strong>{reg.ticket_name}</strong> •{" "}
                    {Number(reg.ticket_price) === 0 ? "Free" : `₹${reg.ticket_price}`}
                </p>

                {reg.qr_code_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={reg.qr_code_url}
                        alt="Ticket QR"
                        className="mx-auto w-64 h-64 border p-2 bg-white"
                    />
                ) : (
                    <p className="text-gray-400">QR not available.</p>
                )}

                <p className="font-mono text-xs break-all text-gray-600">
                    {reg.ticket_code}
                </p>

                {reg.qr_code_url && (
                    <a
                        href={reg.qr_code_url}
                        download
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Download QR
                    </a>
                )}

                <p className="text-xs text-gray-400">
                    Status: {reg.status.toUpperCase()}
                    {reg.checked_in_at && ` • Checked in at ${new Date(reg.checked_in_at).toLocaleString()}`}
                </p>
            </div>

            <p className="text-center text-sm">
                <Link href="/my-registrations" className="text-blue-600">
                    ← Back to my registrations
                </Link>
            </p>
        </main>
    );
}

export default function TicketPage() {
    return (
        <RequireRole role="attendee">
            <Suspense fallback={<main className="p-8">Loading...</main>}>
                <TicketContent />
            </Suspense>
        </RequireRole>
    );
}