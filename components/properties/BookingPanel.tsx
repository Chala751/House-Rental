"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type BookingPanelProps = {
    propertyId: string;
    nightlyRate: number;
    hostName: string;
    isSignedIn: boolean;
};

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

function getTodayISODate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function addDaysISODate(dateStr: string, days: number) {
    const base = new Date(dateStr);
    if (Number.isNaN(base.getTime())) {
        return "";
    }
    base.setDate(base.getDate() + days);
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, "0");
    const dd = String(base.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function BookingPanel({
    propertyId,
    nightlyRate,
    hostName,
    isSignedIn,
}: BookingPanelProps) {
    const router = useRouter();
    const today = getTodayISODate();
    const [checkIn, setCheckIn] = useState(today);
    const [checkOut, setCheckOut] = useState(addDaysISODate(today, 1));
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [bookedId, setBookedId] = useState("");

    const nights = useMemo(() => {
        const from = new Date(checkIn);
        const to = new Date(checkOut);
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
            return 0;
        }
        return Math.ceil((to.getTime() - from.getTime()) / ONE_DAY_MS);
    }, [checkIn, checkOut]);

    const totalPrice = nights > 0 ? nights * nightlyRate : 0;
    const formattedNightlyRate = new Intl.NumberFormat("en-US").format(nightlyRate);
    const formattedTotal = new Intl.NumberFormat("en-US").format(totalPrice);

    async function handleBook() {
        setError("");
        setSuccess("");
        setBookedId("");

        if (nights <= 0) {
            setError("Check-out must be after check-in.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    propertyId,
                    checkIn,
                    checkOut,
                }),
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setError(data?.message || "Failed to create booking.");
                return;
            }

            setSuccess("Booking confirmed. You can view it in your dashboard.");
            if (data?._id) {
                setBookedId(String(data._id));
            }
            router.refresh();
        } catch {
            setError("Something went wrong while creating booking.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <aside
            id="book-panel"
            className="h-fit scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6"
        >
            <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Reserve this stay
            </p>
            <p className="mt-3 text-4xl font-black text-slate-900">${formattedNightlyRate}</p>
            <p className="mt-1 text-sm text-slate-500">per night</p>
            <p className="mt-4 text-sm text-slate-600">Hosted by {hostName}</p>

            {!isSignedIn ? (
                <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
                    <p className="text-sm font-semibold text-orange-700">
                        To book this property, you must sign in.
                    </p>
                    <div className="mt-3 flex gap-2">
                        <Link
                            href="/auth/login"
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/auth/signup"
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
                        >
                            Create account
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <div>
                            <label
                                htmlFor="check-in"
                                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                            >
                                Check in
                            </label>
                            <input
                                id="check-in"
                                type="date"
                                min={today}
                                value={checkIn}
                                onChange={(e) => {
                                    const nextCheckIn = e.target.value;
                                    setCheckIn(nextCheckIn);
                                    if (checkOut <= nextCheckIn) {
                                        setCheckOut(addDaysISODate(nextCheckIn, 1));
                                    }
                                }}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="check-out"
                                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                            >
                                Check out
                            </label>
                            <input
                                id="check-out"
                                type="date"
                                min={addDaysISODate(checkIn, 1)}
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        <div className="flex items-center justify-between">
                            <p>
                                ${formattedNightlyRate} x {nights > 0 ? nights : 0} night(s)
                            </p>
                            <p>${formattedTotal}</p>
                        </div>
                        <div className="mt-2 border-t border-slate-200 pt-2">
                            <div className="flex items-center justify-between font-semibold text-slate-900">
                                <p>Total</p>
                                <p>${formattedTotal}</p>
                            </div>
                        </div>
                        {nights <= 0 && (
                            <p className="mt-2 text-xs font-medium text-red-600">
                                Select valid dates to continue.
                            </p>
                        )}
                    </div>

                    {error && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </p>
                    )}
                    {success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
                            <p>{success}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <Link
                                    href="/dashboard"
                                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
                                >
                                    Go to dashboard
                                </Link>
                                {bookedId && (
                                    <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                        Booking ID: {bookedId}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleBook}
                        disabled={submitting || nights <= 0}
                        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? "Booking..." : "Book this property"}
                    </button>
                </div>
            )}
        </aside>
    );
}
