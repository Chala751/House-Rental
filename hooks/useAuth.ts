"use client";

import { useEffect, useState } from "react";

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    async function fetchUser() {
        try {
            const res = await fetch("/api/auth/me");
            if (!res.ok) throw new Error();
            const data = await res.json();
            setUser(data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    async function login(email: string, password: string) {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) throw new Error("Login failed");
        await fetchUser();
    }

    async function signup(data: any) {
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Signup failed");
        await fetchUser();
    }

    async function logout() {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
    }

    return {
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
    };
}
