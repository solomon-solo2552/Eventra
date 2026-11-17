"use client";

import { Suspense } from "react";
import { EditEventContent } from "./EditEventContent";

export default function EditEventPage() {
    return (
        <Suspense fallback={<main className="p-8">Loading...</main>}>
            <EditEventContent />
        </Suspense>
    );
}