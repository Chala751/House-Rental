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
        <main className="relative min-h-screen overflow-hidden bg-amber-50 px-4 py-12 text-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.30),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.20),_transparent_40%)]" />
            <div className="relative mx-auto max-w-5xl">
                <Link
                    href="/"
                    className="mb-8 inline-block text-sm font-semibold text-slate-700 transition hover:text-slate-900"
                >
                    Back to home
                </Link>

                <div className="grid items-stretch gap-6 md:grid-cols-2">
                    <section className="rounded-3xl border border-orange-100 bg-white/75 p-8 backdrop-blur">
                        <p className="text-sm font-semibold uppercase tracking-widest text-orange-700">
                            Join StayScape
                        </p>
                        <h1 className="mt-3 text-4xl font-black leading-tight">
                            Create your rental account.
                        </h1>
                        <p className="mt-4 text-slate-700">
                            Book homes, list your property, or do both from one dashboard.
                        </p>
                        <div className="mt-8 space-y-3 text-sm text-slate-700">
                            <p className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2">
                                Find trusted rentals with clear pricing
                            </p>
                            <p className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2">
                                Manage listings and reservations easily
                            </p>
                            <p className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2">
                                Switch roles anytime from your account
                            </p>
                        </div>
                    </section>

                    <section className="rounded-3xl bg-slate-900 p-8 text-white shadow-2xl">
                        <h2 className="text-2xl font-black">Sign up</h2>
                        <p className="mt-2 text-sm text-slate-300">
                            Start with your details below.
                        </p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="name" className="mb-1 block text-sm font-semibold">
                                    Name
                                </label>
                                <input
                                    id="name"
                                    placeholder="Your full name"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-400/20"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="mb-1 block text-sm font-semibold">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-400/20"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-1 block text-sm font-semibold">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    placeholder="Create a secure password"
                                    type="password"
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm({ ...form, password: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-400/20"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="role" className="mb-1 block text-sm font-semibold">
                                    Account type
                                </label>
                                <select
                                    id="role"
                                    value={form.role}
                                    onChange={(e) =>
                                        setForm({ ...form, role: e.target.value })
                                    }
                                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-400/20"
                                >
                                    <option value="renter" className="text-slate-900">
                                        Renter
                                    </option>
                                    <option value="host" className="text-slate-900">
                                        Host
                                    </option>
                                    <option value="both" className="text-slate-900">
                                        Admin
                                    </option>
                                </select>
                            </div>

                            {error && (
                                <p className="rounded-lg border border-red-300/30 bg-red-200/10 px-3 py-2 text-sm text-red-200">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? "Creating account..." : "Create account"}
                            </button>
                        </form>

                        <p className="mt-5 text-sm text-slate-300">
                            Already have an account?{" "}
                            <Link href="/auth/login" className="font-semibold text-orange-300 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
