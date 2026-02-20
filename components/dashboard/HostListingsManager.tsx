"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, Bath, Users, MapPin, Trash2 } from "lucide-react";

type Listing = {
    id: string;
    title: string;
    description: string;
    location: string;
    pricePerNight: number;
    bedrooms?: number;
    bathrooms?: number;
    maxGuests?: number;
    imageUrl: string | null;
};

type HostListingsManagerProps = {
    listings: Listing[];
};

export default function HostListingsManager({ listings }: HostListingsManagerProps) {
    const router = useRouter();
    const [items, setItems] = useState(listings);
    const [error, setError] = useState("");
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [confirmListingId, setConfirmListingId] = useState<string | null>(null);

    const confirmListing = useMemo(
        () => items.find((item) => item.id === confirmListingId) || null,
        [items, confirmListingId]
    );

    async function handleDeleteConfirmed() {
        if (!confirmListingId) {
            return;
        }

        setError("");
        setPendingDeleteId(confirmListingId);

        try {
            const res = await fetch(`/api/properties/${confirmListingId}`, {
                method: "DELETE",
            });

            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(payload?.message || "Failed to delete property.");
            }

            setItems((prev) => prev.filter((item) => item.id !== confirmListingId));
            setConfirmListingId(null);
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Could not delete property right now."
            );
        } finally {
            setPendingDeleteId(null);
        }
    }

    if (items.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                No listings yet. Create your first property using the form.
            </div>
        );
    }

    return (
        <>
            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {items.map((listing) => (
                    <article
                        key={listing.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        {listing.imageUrl ? (
                            <div className="relative">
                                <img
                                    src={listing.imageUrl}
                                    alt={listing.title}
                                    className="h-44 w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 to-transparent" />
                                <p className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-slate-900">
                                    ${listing.pricePerNight}/night
                                </p>
                            </div>
                        ) : (
                            <div className="relative flex h-44 w-full items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-sky-100">
                                <p className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
                                    No image uploaded
                                </p>
                            </div>
                        )}

                        <div className="p-5">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{listing.title}</h3>
                                    <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600">
                                        <MapPin size={14} />
                                        {listing.location}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-3 line-clamp-2 text-sm text-slate-600">{listing.description}</p>

                            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-700">
                                {typeof listing.bedrooms === "number" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                                        <BedDouble size={13} />
                                        {listing.bedrooms} bd
                                    </span>
                                )}
                                {typeof listing.bathrooms === "number" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                                        <Bath size={13} />
                                        {listing.bathrooms} ba
                                    </span>
                                )}
                                {typeof listing.maxGuests === "number" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                                        <Users size={13} />
                                        {listing.maxGuests} guests
                                    </span>
                                )}
                            </div>

                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => setConfirmListingId(listing.id)}
                                    disabled={pendingDeleteId === listing.id}
                                    className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Trash2 size={14} />
                                    {pendingDeleteId === listing.id ? "Deleting..." : "Delete property"}
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {confirmListing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
                        <h3 className="text-lg font-black text-slate-900">Delete property?</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Are you sure you want to delete <strong>{confirmListing.title}</strong>?
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            This action cannot be undone. Properties with bookings cannot be deleted.
                        </p>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmListingId(null)}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirmed}
                                disabled={pendingDeleteId === confirmListing.id}
                                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {pendingDeleteId === confirmListing.id ? "Deleting..." : "Confirm delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
