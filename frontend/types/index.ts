export type TicketType = {
    id: number;
    name: string;
    price: string;
    capacity: number;
    sold_count: number;
    seats_left: number;
};

export type Event = {
    id: number;
    organizer: number;
    organizer_name: string;
    title: string;
    description: string;
    venue: string;
    category: string;
    banner_url: string;
    start_at: string;
    end_at: string;
    status: "draft" | "published" | "cancelled";
    ticket_types: TicketType[];
    created_at: string;
};

export type Paginated<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export type Registration = {
    id: number;
    event: number;
    event_title: string;
    event_start_at: string;
    event_venue: string;
    ticket_type: number;
    ticket_name: string;
    ticket_price: string;
    status: "confirmed" | "cancelled";
    ticket_code: string;
    qr_code_url: string | null;
    checked_in_at: string | null;
    created_at: string;
}