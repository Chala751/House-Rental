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
        <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-12 text-slate-100">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.35),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.25),_transparent_50%)]" />
            <div className="relative mx-auto max-w-5xl">
                <Link
                    href="/"
                    className="mb-8 inline-block text-sm font-semibold text-slate-300 transition hover:text-white"
                >
                    Back to home
                </Link>

                <div className="grid items-stretch gap-6 md:grid-cols-2">
                    <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                        <p className="text-sm font-semibold uppercase tracking-widest text-orange-300">
                            Welcome back
                        </p>
                        <h1 className="mt-3 text-4xl font-black leading-tight">
                            Sign in to manage your stays.
                        </h1>
                        <p className="mt-4 text-slate-300">
                            Access your bookings, saved homes, and host messages in one place.
                        </p>
                        <div className="mt-8 space-y-3 text-sm text-slate-300">
                            <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                Secure session-based authentication
                            </p>
                            <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                Fast booking and hosting workflow
                            </p>
                            <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                Built for mobile and desktop
                            </p>
                        </div>
                    </section>

                    <section className="rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
                        <h2 className="text-2xl font-black">Login</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Continue with your email and password.
                        </p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="email" className="mb-1 block text-sm font-semibold">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-1 block text-sm font-semibold">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    placeholder="Enter your password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                    required
                                />
                            </div>

                            {error && (
                                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? "Signing in..." : "Sign in"}
                            </button>
                        </form>

                        <p className="mt-5 text-sm text-slate-600">
                            New here?{" "}
                            <Link href="/auth/signup" className="font-semibold text-orange-700 hover:underline">
                                Create an account
                            </Link>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
