"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const linkClass = (href: string) =>
        `px-3 py-2 rounded text-sm font-medium transition ${pathname === href
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`;

    return (
        <nav className="border-b bg-white sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-lg font-bold text-blue-600">
                        Eventra
                    </Link>
                    <div className="hidden sm:flex items-center gap-1">
                        <Link href="/events" className={linkClass("/events")}>
                            Events
                        </Link>
                        {user && (
                            <Link
                                href="/my-registrations"
                                className={linkClass("/my-registrations")}
                            >
                                My Registrations
                            </Link>
                        )}
                        {user?.role === "organizer" && (
                            <>
                                <Link
                                    href="/organizer/events"
                                    className={linkClass("/organizer/events")}
                                >
                                    My Events
                                </Link>
                                <Link
                                    href="/organizer/checkin"
                                    className={linkClass("/organizer/checkin")}
                                >
                                    Check-in
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <span className="text-sm text-gray-600 hidden sm:inline">
                                {user.full_name} <span className="text-gray-400">({user.role})</span>
                            </span>
                            <button
                                onClick={logout}
                                className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm text-gray-700 hover:text-blue-600 px-3 py-1.5"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}