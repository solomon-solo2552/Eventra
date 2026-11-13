"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/lib/api";
import { User, clearTokens, isLoggedIn } from "@/lib/auth";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    logout: () => void;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    async function refreshUser() {
        try{
            const { data } = await api.get<User>("/auth/me/");
            setUser(data);
        } catch {
            setUser(null);
            clearTokens();
        }
    }

    useEffect(() => {
        if (isLoggedIn()) {
            refreshUser().finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    function logout() {
        clearTokens();
        setUser(null);
        window.location.href = "/login";
    }

    return(
        <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}