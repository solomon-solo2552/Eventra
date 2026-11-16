import Link from "next/link";
import { Event } from "@/types";

export function EventCard({ event }: { event: Event }) {
    const minPrice = event.ticket_types.length
        ? Math.min(...event.ticket_types.map((t) => Number(t.price)))
        : null;

    return (
        <Link
            href={`/events/${event.id}`}
            className="block border rounded-lg overflow-hidden hover:shadow-md transition"
        >
            <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                {event.banner_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                    "No image"
                )}
            </div>
            <div className="p-4 space-y-1">
                <p className="text-xs uppercase text-blue-600">{event.category || "General"}</p>
                <h3 className="font-semibold line-clamp-2">{event.title}</h3>
                <p className="text-sm text-gray-500">{event.venue}</p>
                <p className="text-sm text-gray-500">
                    {new Date(event.start_at).toLocaleString()}
                </p>
                {minPrice !== null && (
                    <p className="text-sm font-medium">
                        {minPrice === 0 ? "Free" : `From ₹${minPrice}`}
                    </p>
                )}
            </div>
        </Link>
    );
}