"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { checkInTicket } from "@/lib/tickets";

function CheckInContent() {
    const params = useSearchParams();
    const [code, setCode] = useState(params.get("code") || "");
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    async function submit(value: string) {
        setBusy(true);
        setError("");
        setResult(null);
        try {
            const data = await checkInTicket(value.trim());
            setResult(data);
        } catch (err: any) {
            setError(
                err.response?.data?.detail ||
                "Check-in failed."
            );
        } finally {
            setBusy(false);
        }
    }

    useEffect(() => {
        if (params.get("code")) {
            submit(params.get("code") as string);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="max-w-xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Check-in</h1>
            <p className="text-sm text-gray-500">
                Scan a QR code or paste the ticket code below.
            </p>

            <form
                onSubmit={(e) => { e.preventDefault(); submit(code); }}
                className="space-y-2"
            >
                <input
                    type="text"
                    placeholder="Paste ticket code (UUID)"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full border p-2 rounded font-mono text-sm"
                />
                <button
                    type="submit"
                    disabled={busy || !code.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
                >
                    {busy ? "Checking..." : "Check in"}
                </button>
            </form>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            {result && (
                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded space-y-1">
                    <p className="font-semibold">{result.detail}</p>
                    {result.attendee && <p>Attendee: {result.attendee}</p>}
                    {result.checked_in_at && (
                        <p className="text-sm text-gray-600">
                            At: {new Date(result.checked_in_at).toLocaleString()}
                        </p>
                    )}
                </div>
            )}
        </main>
    );
}

export default function CheckInPage() {
    return (
        <Suspense fallback={<main className="p-8">Loading...</main>}>
            <CheckInContent />
        </Suspense>
    );
}