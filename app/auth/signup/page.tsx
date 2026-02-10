"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "renter",
    });
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        if (!res.ok) {
            setError("Signup failed");
            return;
        }

        router.push("/dashboard");
        router.refresh();
    }

    return (
        <div style={{ maxWidth: 400, margin: "100px auto" }}>
            <h1>Sign Up</h1>

            <form onSubmit={handleSubmit}>
                <input
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                    }
                />

                <input
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                    }
                />

                <input
                    placeholder="Password"
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />

                <select
                    value={form.role}
                    onChange={(e) =>
                        setForm({ ...form, role: e.target.value })
                    }
                >
                    <option value="renter">Renter</option>
                    <option value="host">Host</option>
                    <option value="both">Both</option>
                </select>

                {error && <p style={{ color: "red" }}>{error}</p>}

                <button type="submit">Create account</button>
            </form>
        </div>
    );
}
