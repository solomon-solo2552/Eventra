"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RequireRole({
    role, children,
}: { role: "attendee" | "organizer"; children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!user) router.replace("/login");
        else if (user.role !== role) router.replace("/");
    }, [user, loading, role, router]);

    if (loading || !user || user.role !== role) {
        return <main className="p-8 text-gray-500">Redirecting...</main>;
    }
    return <>{children}</>;
}