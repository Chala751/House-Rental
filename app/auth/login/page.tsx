"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                setError("Invalid email or password");
                return;
            }

            const nextPath = searchParams.get("next");
            const safeNext =
                nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard";

            router.push(safeNext);
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
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Welcome back</p>
                    <h1 className="font-display font-semibold leading-[1.08] tracking-tight text-[clamp(1.5rem,1.15rem+1.1vw,1.95rem)] mt-3 text-ink">
                        Sign in to your stays
                    </h1>
                    <p className="mt-3 text-[0.95rem] text-ink-soft">
                        Your bookings, saved homes, and hosting tools in one place.
                    </p>
                </div>

                <div className="rounded-3xl border border-line bg-surface shadow-card mt-8 p-7 shadow-soft">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-[0.8125rem] font-medium text-ink-soft">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[0.9375rem] text-ink transition placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15"
                                required
                            />
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
                            {isSubmitting ? "Signing in…" : "Sign in"}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-ink-soft">
                    New to StayScape?{" "}
                    <Link
                        href="/auth/signup"
                        className="font-medium text-accent underline-offset-4 hover:underline"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}
