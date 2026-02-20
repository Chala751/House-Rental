"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CompletedStay = {
    bookingId: string;
    propertyTitle: string;
    propertyLocation: string;
    checkOut: string;
    rating?: number;
    comment?: string;
    reviewedAt?: string;
};

type CompletedStayReviewsProps = {
    stays: CompletedStay[];
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}

export default function CompletedStayReviews({ stays }: CompletedStayReviewsProps) {
    const router = useRouter();
    const [items, setItems] = useState(stays);
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [drafts, setDrafts] = useState<Record<string, { rating: number; comment: string }>>(
        () =>
            stays.reduce((acc, item) => {
                acc[item.bookingId] = {
                    rating: item.rating || 5,
                    comment: item.comment || "",
                };
                return acc;
            }, {} as Record<string, { rating: number; comment: string }>)
    );

    const pendingReviews = useMemo(
        () => items.filter((item) => !item.reviewedAt).length,
        [items]
    );

    function updateDraft(
        bookingId: string,
        next: Partial<{ rating: number; comment: string }>
    ) {
        setDrafts((prev) => ({
            ...prev,
            [bookingId]: {
                rating: next.rating ?? prev[bookingId]?.rating ?? 5,
                comment: next.comment ?? prev[bookingId]?.comment ?? "",
            },
        }));
    }

    async function submitReview(bookingId: string) {
        const draft = drafts[bookingId];
        const rating = Number(draft?.rating || 0);
        const comment = String(draft?.comment || "").trim();

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            setErrors((prev) => ({ ...prev, [bookingId]: "Rating must be between 1 and 5." }));
            return;
        }

        if (comment.length < 3) {
            setErrors((prev) => ({
                ...prev,
                [bookingId]: "Comment must be at least 3 characters.",
            }));
            return;
        }

        setPendingId(bookingId);
        setErrors((prev) => ({ ...prev, [bookingId]: "" }));

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingId,
                    rating,
                    comment,
                }),
            });

            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(payload?.message || "Failed to submit review.");
            }

            setItems((prev) =>
                prev.map((item) =>
                    item.bookingId === bookingId
                        ? {
                              ...item,
                              rating: Number(payload?.rating || rating),
                              comment: String(payload?.comment || comment),
                              reviewedAt: String(payload?.createdAt || new Date().toISOString()),
                          }
                        : item
                )
            );
            router.refresh();
        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                [bookingId]:
                    err instanceof Error ? err.message : "Could not submit review right now.",
            }));
        } finally {
            setPendingId(null);
        }
    }

    if (items.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                No completed stays yet.
            </div>
        );
    }

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Rate completed stays</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Share feedback for hosts after checkout.
                    </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Pending reviews: {pendingReviews}
                </span>
            </div>

            <div className="mt-4 space-y-3">
                {items.map((item) => {
                    const draft = drafts[item.bookingId] || { rating: 5, comment: "" };
                    const error = errors[item.bookingId];
                    const isDone = Boolean(item.reviewedAt);
                    const isPending = pendingId === item.bookingId;

                    return (
                        <article
                            key={item.bookingId}
                            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        {item.propertyTitle}
                                    </h3>
                                    <p className="text-xs text-slate-600">{item.propertyLocation}</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Completed on {formatDate(item.checkOut)}
                                    </p>
                                </div>
                                {isDone && (
                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        Reviewed
                                    </span>
                                )}
                            </div>

                            {isDone ? (
                                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
                                    <p className="font-semibold text-emerald-800">
                                        Rating: {item.rating}/5
                                    </p>
                                    <p className="mt-1 text-emerald-700">{item.comment}</p>
                                    <p className="mt-1 text-xs text-emerald-700/90">
                                        Submitted on {formatDate(String(item.reviewedAt))}
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-3 space-y-3">
                                    <div className="grid gap-3 md:grid-cols-[140px_1fr]">
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                Rating
                                            </label>
                                            <select
                                                value={draft.rating}
                                                onChange={(e) =>
                                                    updateDraft(item.bookingId, {
                                                        rating: Number(e.target.value),
                                                    })
                                                }
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                            >
                                                <option value={5}>5 - Excellent</option>
                                                <option value={4}>4 - Very good</option>
                                                <option value={3}>3 - Good</option>
                                                <option value={2}>2 - Fair</option>
                                                <option value={1}>1 - Poor</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                Comment
                                            </label>
                                            <textarea
                                                value={draft.comment}
                                                onChange={(e) =>
                                                    updateDraft(item.bookingId, {
                                                        comment: e.target.value,
                                                    })
                                                }
                                                rows={3}
                                                placeholder="Write your experience with the stay and host."
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                                            {error}
                                        </p>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => submitReview(item.bookingId)}
                                        disabled={isPending}
                                        className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {isPending ? "Submitting..." : "Submit review"}
                                    </button>
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
