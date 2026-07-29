"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type BookingPanelProps = {
    propertyId: string;
    nightlyRate: number;
    hostName: string;
    isSignedIn: boolean;
    canBook: boolean;
};

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

function getTodayISODate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function parseISODate(value: string) {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) {
        return new Date("invalid");
    }
    return new Date(year, month - 1, day);
}

function addDaysISODate(dateStr: string, days: number) {
    const base = parseISODate(dateStr);
    if (Number.isNaN(base.getTime())) {
        return "";
    }
    base.setDate(base.getDate() + days);
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, "0");
    const dd = String(base.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function formatMoney(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
}

export default function BookingPanel({
    propertyId,
    nightlyRate,
    hostName,
    isSignedIn,
    canBook,
}: BookingPanelProps) {
    const router = useRouter();
    const panelRef = useRef<HTMLElement | null>(null);
    const didAutoFocusRef = useRef(false);
    const today = getTodayISODate();
    const [checkIn, setCheckIn] = useState(today);
    const [checkOut, setCheckOut] = useState(addDaysISODate(today, 1));
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [bookedId, setBookedId] = useState("");

    const nights = useMemo(() => {
        const from = parseISODate(checkIn);
        const to = parseISODate(checkOut);
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
            return 0;
        }
        return Math.ceil((to.getTime() - from.getTime()) / ONE_DAY_MS);
    }, [checkIn, checkOut]);

    const totalPrice = nights > 0 ? nights * nightlyRate : 0;

    useEffect(() => {
        if (didAutoFocusRef.current) {
            return;
        }

        const shouldFocusPanel =
            new URLSearchParams(window.location.search).get("book") === "1" ||
            window.location.hash === "#book-panel";

        if (!shouldFocusPanel || !panelRef.current) {
            return;
        }

        didAutoFocusRef.current = true;
        panelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);

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
            ref={panelRef}
            className="rounded-3xl border border-line bg-surface shadow-card h-fit scroll-mt-24 p-6 shadow-soft lg:sticky lg:top-24"
        >
            <div className="flex items-baseline gap-1.5">
                <span className="font-display font-semibold leading-[1.08] tracking-tight text-[2.1rem] text-ink">
                    {formatMoney(nightlyRate)}
                </span>
                <span className="text-sm text-ink-muted">/ night</span>
            </div>
            <p className="mt-1.5 text-sm text-ink-soft">Hosted by {hostName}</p>

            {!isSignedIn ? (
                <div className="mt-6">
                    <p className="rounded-xl border px-3.5 py-2.5 text-sm border-accent-line bg-accent-soft text-accent">
                        Sign in to reserve this home.
                    </p>
                    <div className="mt-3.5 flex gap-2.5">
                        <Link
                            href={`/auth/login?next=${encodeURIComponent(
                                `/properties/${propertyId}#book-panel`
                            )}`}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 text-[0.8125rem] bg-accent text-white shadow-card hover:bg-accent-hover flex-1"
                        >
                            Sign in
                        </Link>
                        <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 text-[0.8125rem] border-line-strong bg-surface text-ink hover:border-ink-soft flex-1">
                            Create account
                        </Link>
                    </div>
                </div>
            ) : !canBook ? (
                <div className="mt-6">
                    <p className="rounded-xl border px-3.5 py-2.5 text-sm border-accent-line bg-accent-soft text-accent">
                        Booking is available on renter accounts only. Switch your role to
                        renter to reserve this home.
                    </p>
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <div>
                            <label htmlFor="check-in" className="mb-1.5 block text-[0.8125rem] font-medium text-ink-soft">
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
                                className="w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[0.9375rem] text-ink transition placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15"
                            />
                        </div>
                        <div>
                            <label htmlFor="check-out" className="mb-1.5 block text-[0.8125rem] font-medium text-ink-soft">
                                Check out
                            </label>
                            <input
                                id="check-out"
                                type="date"
                                min={addDaysISODate(checkIn, 1)}
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                className="w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[0.9375rem] text-ink transition placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-accent/15"
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-line bg-sunken p-4 text-sm">
                        <div className="flex items-center justify-between text-ink-soft">
                            <span>
                                {formatMoney(nightlyRate)} × {nights > 0 ? nights : 0} night
                                {nights === 1 ? "" : "s"}
                            </span>
                            <span>{formatMoney(totalPrice)}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-line pt-3 font-semibold text-ink">
                            <span>Total</span>
                            <span>{formatMoney(totalPrice)}</span>
                        </div>
                        {nights <= 0 && (
                            <p className="mt-2.5 text-xs text-critical">
                                Select valid dates to continue.
                            </p>
                        )}
                    </div>

                    {error && <p className="rounded-xl border px-3.5 py-2.5 text-sm border-critical/30 bg-critical-soft text-critical">{error}</p>}

                    {success && (
                        <div className="rounded-xl border px-3.5 py-2.5 text-sm border-positive/30 bg-positive-soft text-positive">
                            <p>{success}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 text-[0.8125rem] bg-ink text-white hover:bg-ink/90">
                                    Go to dashboard
                                </Link>
                                {bookedId && (
                                    <span className="text-xs text-ink-muted">
                                        Ref {bookedId.slice(-8)}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleBook}
                        disabled={submitting || nights <= 0}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-5 py-2.5 text-sm bg-accent text-white shadow-card hover:bg-accent-hover w-full"
                    >
                        {submitting ? "Booking…" : "Reserve this home"}
                    </button>

                    <p className="text-center text-xs text-ink-muted">
                        You won&apos;t be charged yet.
                    </p>
                </div>
            )}
        </aside>
    );
}
