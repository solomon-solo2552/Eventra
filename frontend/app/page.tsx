"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Eventra</h1>
      <p className="text-gray-600">Discover. Book. Experience.</p>

      {user ? (
        <div className="space-y-2">
          <p>Welcome, <strong>{user.full_name}</strong> ({user.role})</p>
          <button onClick={logout} className="bg-gray-200 px-4 py-2 rounded">
            Logout
          </button>
        </div>
      ) : (
        <div className="space-x-4">
          <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded">Login</Link>
          <Link href="/register" className="bg-gray-200 px-4 py-2 rounded">Register</Link>
        </div>
      )}
    </main>
  );
}