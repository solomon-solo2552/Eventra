export type User = {
    id: number;
    email: string;
    full_name: string;
    role: "attendee" | "organizer";
};

export function saveTokens(access: string, refresh: string) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
}


export function clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}


export function isLoggedIn(): boolean {
    return !!localStorage.getItem("access_token");
}