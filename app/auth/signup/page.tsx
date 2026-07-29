"use client";

import { useState } from "react";
import Link from "next/link";
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
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
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8 flex justify-center py-16 md:py-24">
            <div className="w-full max-w-[26rem]">
                <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Join StayScape</p>
                    <h1 className="font-display font-semibold leading-[1.08] tracking-tight text-[clamp(1.5rem,1.15rem+1.1vw,1.95rem)] mt-3 text-ink">
                        Create your account
                    </h1>
                    <p className="mt-3 text-[0.95rem] text-ink-soft">
                        Book homes, list your property, or do both from one dashboard.
                    </p>
                </div>

                <div className="rounded-3xl border border-line bg-surface shadow-card mt-8 p-7 shadow-soft">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="mb-1.5 block text-[0.8125rem] font-medium text-ink-soft">
                                Full name
                            </label>
                            <input
                                id="name"
                                autoComplete="name"
                                placeholder="Your full name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[0.9375rem] text-ink transition placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-[0.8125rem] font-medium text-ink-soft">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[0.9375rem] text-ink transition placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-[0.8125rem] font-medium text-ink-soft">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Create a secure password"
                                value={form.password}
                                onChange={(e) =>
                                    setForm({ ...form, password: e.target.value })
                                }
                                className="w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[0.9375rem] text-ink transition placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="mb-1.5 block text-[0.8125rem] font-medium text-ink-soft">
                                Account type
                            </label>
                            <select
                                id="role"
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[0.9375rem] text-ink transition placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15"
                            >
                                <option value="renter">Renter</option>
                                <option value="host">Host</option>
                                <option value="both">Admin</option>
                            </select>
                        </div>

                        {error && (
                            <p className="rounded-xl border px-3.5 py-2.5 text-sm border-critical/30 bg-critical-soft text-critical" role="alert">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-5 py-2.5 text-sm bg-accent text-white shadow-card hover:bg-accent-hover w-full"
                        >
                            {isSubmitting ? "Creating account…" : "Create account"}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-ink-soft">
                    Already have an account?{" "}
                    <Link
                        href="/auth/login"
                        className="font-medium text-accent underline-offset-4 hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
