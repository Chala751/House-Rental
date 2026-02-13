"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

type Property = {
    _id: string;
    title: string;
    location: string;
    pricePerNight: number;
    images?: string[];
    host?: {
        name?: string;
    };
    bedrooms?: number;
    bathrooms?: number;
    maxGuests?: number;
};

export default function PropertyGrid() {
    const { user } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/properties")
            .then((res) => res.json())
            .then((data: Property[]) => setProperties(data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                Loading properties...
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
                No properties yet. Hosts can add listings from the dashboard.
            </div>
        );
    }

    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
                <div
                    key={p._id}
                    className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    <Link href={`/properties/${p._id}`} className="group block">
                        {p.images?.[0] ? (
                            <img
                                src={p.images[0]}
                                alt={p.title}
                                className="mb-4 h-36 w-full rounded-xl object-cover"
                            />
                        ) : (
                            <div className="mb-4 h-36 rounded-xl bg-gradient-to-br from-orange-100 via-amber-50 to-sky-100" />
                        )}
                        <h3 className="text-lg font-bold transition group-hover:text-orange-700">
                            {p.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">{p.location}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                            Host: {p.host?.name || "Unknown host"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                            {typeof p.bedrooms === "number" && (
                                <span className="rounded-full bg-slate-100 px-2 py-1">
                                    {p.bedrooms} bd
                                </span>
                            )}
                            {typeof p.bathrooms === "number" && (
                                <span className="rounded-full bg-slate-100 px-2 py-1">
                                    {p.bathrooms} ba
                                </span>
                            )}
                            {typeof p.maxGuests === "number" && (
                                <span className="rounded-full bg-slate-100 px-2 py-1">
                                    {p.maxGuests} guests
                                </span>
                            )}
                        </div>
                        <p className="mt-4 text-base font-bold text-slate-900">
                            ${p.pricePerNight}
                            <span className="ml-1 text-sm font-normal text-slate-600">
                                / night
                            </span>
                        </p>
                    </Link>

                    <div className="mt-4 flex gap-2">
                        <Link
                            href={`/properties/${p._id}`}
                            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-500"
                        >
                            View details
                        </Link>
                        <Link
                            href={
                                user && (user.role === "renter" || user.role === "both")
                                    ? `/properties/${p._id}?book=1#book-panel`
                                    : `/auth/login?next=${encodeURIComponent(
                                          `/properties/${p._id}?book=1#book-panel`
                                      )}`
                            }
                            className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-emerald-500"
                        >
                            Book now
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
