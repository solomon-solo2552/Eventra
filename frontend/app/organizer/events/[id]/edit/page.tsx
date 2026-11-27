"use client";

import { Suspense } from "react";
import { EditEventContent } from "./EditEventContent";
import { RequireRole } from "@/components/auth/RequireRole";

export default function EditEventPage() {
    return (
        <RequireRole role="organizer">
            <Suspense fallback={<main className="p-8">Loading...</main>}>
                <EditEventContent />
            </Suspense>
        </RequireRole>
    );
}

