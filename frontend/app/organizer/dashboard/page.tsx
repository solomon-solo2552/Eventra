"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { fetchOrganizerStats, OrganizerStats } from "@/lib/organizer";

export default function DashboardPage() {
    const [stats, setStats] = useState<OrganizerStats | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchOrganizerStats().then(setStats).catch(() => setError("Could not load stats."));
    }, []);

    if (error) return <main className="p-8 text-red-500">{error}</main>;
    if (!stats) return <main className="p-8">Loading...</main>;

    return (
        <main className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Link href="/organizer/events" className="text-blue-600 text-sm">My Events →</Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Events" value={stats.total_events} />
                <StatCard label="Registrations" value={stats.total_registrations} />
                <StatCard label="Revenue" value={`₹${stats.revenue.toFixed(0)}`} />
                <StatCard label="Check-in Rate" value={`${stats.check_in_rate}%`} />
            </div>

            <section className="border rounded p-4">
                <h2 className="font-semibold mb-4">Top Events by Registrations</h2>
                {stats.top_events.length === 0 ? (
                    <p className="text-gray-500 text-sm">No events yet.</p>
                ) : (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.top_events}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="title" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="confirmed_count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>
        </main>
    );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="border rounded p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
        </div>
    );
}