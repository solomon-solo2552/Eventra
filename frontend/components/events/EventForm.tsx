"use client";

import { useState } from "react";
import { Event, TicketType } from "@/types";

type Props = {
    initial?: Event;
    onSubmit: (payload: any) => Promise<void>;
    submitLabel: string;
};

export function EventForm({ initial, onSubmit, submitLabel }: Props) {
    const [form, setForm] = useState({
        title: initial?.title || "",
        description: initial?.description || "",
        venue: initial?.venue || "",
        category: initial?.category || "",
        banner_url: initial?.banner_url || "",
        start_at: initial?.start_at?.slice(0, 16) || "",
        end_at: initial?.end_at?.slice(0, 16) || "",
        status: initial?.status || "draft",
    });

    const [tiers, setTiers] = useState<Partial<TicketType>[]>(
        initial?.ticket_types?.map((t) => ({
            name: t.name, price: t.price, capacity: t.capacity,
        })) || [{ name: "General", price: "0.00", capacity: 100 }]
    );

    const [error, setError] = useState("");

    function updateTier(i: number, key: string, value: any) {
        setTiers((prev) => prev.map((t, idx) => idx === i ? { ...t, [key]: value } : t));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        try {
            await onSubmit({
                ...form,
                start_at: new Date(form.start_at).toISOString(),
                end_at: new Date(form.end_at).toISOString(),
                ticket_types: tiers,
            });
        } catch (err: any) {
            setError(JSON.stringify(err.response?.data || "Save failed"));
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <input required placeholder="Title" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border p-2 rounded" />

            <textarea placeholder="Description" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border p-2 rounded" rows={4} />

            <input required placeholder="Venue" value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                className="w-full border p-2 rounded" />

            <input placeholder="Category (e.g. Tech)" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border p-2 rounded" />

            <input placeholder="Banner image URL (optional)" value={form.banner_url}
                onChange={(e) => setForm({ ...form, banner_url: e.target.value })}
                className="w-full border p-2 rounded" />

            <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">Start
                    <input required type="datetime-local" value={form.start_at}
                        onChange={(e) => setForm({ ...form, start_at: e.target.value })}
                        className="w-full border p-2 rounded mt-1" />
                </label>
                <label className="text-sm">End
                    <input required type="datetime-local" value={form.end_at}
                        onChange={(e) => setForm({ ...form, end_at: e.target.value })}
                        className="w-full border p-2 rounded mt-1" />
                </label>
            </div>

            <select value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full border p-2 rounded">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
            </select>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Ticket Tiers</h3>
                    <button type="button"
                        onClick={() => setTiers([...tiers, { name: "", price: "0.00", capacity: 50 }])}
                        className="text-blue-600 text-sm">
                        + Add tier
                    </button>
                </div>
                {tiers.map((t, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2">
                        <input required placeholder="Name" value={t.name || ""}
                            onChange={(e) => updateTier(i, "name", e.target.value)}
                            className="border p-2 rounded" />
                        <input required type="number" min="0" step="0.01" placeholder="Price"
                            value={t.price as any}
                            onChange={(e) => updateTier(i, "price", e.target.value)}
                            className="border p-2 rounded" />
                        <input required type="number" min="1" placeholder="Capacity"
                            value={t.capacity as any}
                            onChange={(e) => updateTier(i, "capacity", Number(e.target.value))}
                            className="border p-2 rounded" />
                    </div>
                ))}
            </div>

            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
                {submitLabel}
            </button>
        </form>
    );
}