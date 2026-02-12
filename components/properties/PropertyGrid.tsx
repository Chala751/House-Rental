"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Property = {
    _id: string;
    title: string;
    location: string;
    pricePerNight: number;
    images?: string[];
    bedrooms?: number;
    bathrooms?: number;
    maxGuests?: number;
};

export default function PropertyGrid() {
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
                <Link key={p._id} href={`/properties/${p._id}`} className="group">
                    <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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
                    </div>
                </Link>
            ))}
        </div>
    );
}
