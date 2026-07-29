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

function formatPrice(value: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);
}

function buildFacts(property: Property) {
    const facts: string[] = [];

    if (typeof property.bedrooms === "number") {
        facts.push(`${property.bedrooms} bed${property.bedrooms === 1 ? "" : "s"}`);
    }
    if (typeof property.bathrooms === "number") {
        facts.push(`${property.bathrooms} bath${property.bathrooms === 1 ? "" : "s"}`);
    }
    if (typeof property.maxGuests === "number") {
        facts.push(`${property.maxGuests} guest${property.maxGuests === 1 ? "" : "s"}`);
    }

    return facts;
}

function CardSkeleton() {
    return (
        <div className="rounded-2xl border border-line bg-surface shadow-card overflow-hidden">
            <div className="aspect-[4/3] w-full animate-pulse bg-sunken" />
            <div className="space-y-2.5 p-5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-sunken" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-sunken" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-sunken" />
            </div>
        </div>
    );
}

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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((key) => (
                    <CardSkeleton key={key} />
                ))}
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-line-strong bg-surface p-12 text-center">
                <p className="text-ink-soft">
                    No homes listed yet — hosts can add listings from the dashboard.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => {
                const facts = buildFacts(p);
                const canBookDirectly =
                    user && (user.role === "renter" || user.role === "both");
                const bookHref = canBookDirectly
                    ? `/properties/${p._id}?book=1#book-panel`
                    : `/auth/login?next=${encodeURIComponent(
                          `/properties/${p._id}?book=1#book-panel`
                      )}`;

                return (
                    <article
                        key={p._id}
                        className="rounded-2xl border border-line bg-surface shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-soft group flex flex-col overflow-hidden"
                    >
                        <Link
                            href={`/properties/${p._id}`}
                            className="relative block overflow-hidden"
                            tabIndex={-1}
                            aria-hidden="true"
                        >
                            {p.images?.[0] ? (
                                <img
                                    src={p.images[0]}
                                    alt=""
                                    loading="lazy"
                                    className="block w-full bg-sunken object-cover aspect-[4/3] transition-transform duration-500 group-hover:scale-[1.04]"
                                />
                            ) : (
                                <div className="flex aspect-[4/3] items-center justify-center bg-sunken">
                                    <span className="text-xs text-ink-muted">
                                        No photo yet
                                    </span>
                                </div>
                            )}
                        </Link>

                        <div className="flex flex-1 flex-col p-5">
                            <h3 className="text-[1.05rem] font-semibold leading-snug text-ink">
                                <Link
                                    href={`/properties/${p._id}`}
                                    className="transition-colors hover:text-accent"
                                >
                                    {p.title}
                                </Link>
                            </h3>

                            <p className="mt-1 text-sm text-ink-soft">{p.location}</p>

                            {facts.length > 0 && (
                                <p className="mt-2 text-[0.8125rem] text-ink-muted">
                                    {facts.join(" · ")}
                                </p>
                            )}

                            <p className="mt-1.5 text-[0.8125rem] text-ink-muted">
                                Hosted by {p.host?.name || "Unknown host"}
                            </p>

                            <div className="mt-5 flex items-baseline gap-1.5 border-t border-line pt-4">
                                <span className="font-display font-semibold leading-[1.08] tracking-tight text-[1.4rem] text-ink">
                                    {formatPrice(p.pricePerNight)}
                                </span>
                                <span className="text-sm text-ink-muted">/ night</span>
                            </div>

                            <div className="mt-4 flex gap-2.5">
                                <Link
                                    href={`/properties/${p._id}`}
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 text-[0.8125rem] border-line-strong bg-surface text-ink hover:border-ink-soft flex-1"
                                >
                                    View details
                                </Link>
                                <Link href={bookHref} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 text-[0.8125rem] bg-accent text-white shadow-card hover:bg-accent-hover flex-1">
                                    Book now
                                </Link>
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}
