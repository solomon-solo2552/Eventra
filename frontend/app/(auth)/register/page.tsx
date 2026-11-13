"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "", full_name: "", password: "", role: "attendee",
  });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register/", form);
      router.push("/login");
    } catch (err: any) {
      setError(JSON.stringify(err.response?.data || "Registration failed"));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 p-8 border rounded-lg">
        <h1 className="text-2xl font-bold">Join Eventra</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input type="text" placeholder="Full Name" required
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="w-full border p-2 rounded" />
        <input type="email" placeholder="Email" required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border p-2 rounded" />
        <input type="password" placeholder="Password (min 8 chars)" required
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border p-2 rounded" />
        <select value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full border p-2 rounded">
          <option value="attendee">Attendee</option>
          <option value="organizer">Organizer</option>
        </select>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
          Create Account
        </button>
      </form>
    </div>
  );
}