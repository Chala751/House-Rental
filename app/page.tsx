import Link from "next/link";
import { Star } from "lucide-react";
import PropertyGrid from "@/components/properties/PropertyGrid";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Booking from "@/models/Booking";
import Review from "@/models/Review";

const valuePoints = [
    {
        title: "Flexible stays",
        description: "Book for one night, a week, or a month with clear terms.",
    },
    {
        title: "Trusted hosts",
        description: "Stay with hosts who provide complete details and fast responses.",
    },
    {
        title: "No hidden pricing",
        description: "Compare homes with transparent nightly rates before checkout.",
    },
];

function formatCount(value: number) {
    if (!Number.isFinite(value) || value <= 0) {
        return "0";
    }

    return new Intl.NumberFormat("en-US").format(value);
}

function getCityFromLocation(location: string) {
    const clean = String(location || "").trim();
    if (!clean) {
        return "";
    }

    return clean.split(",")[0]?.trim().toLowerCase() || clean.toLowerCase();
}

function renderStars(rating: number) {
    const safeRating = Math.max(1, Math.min(5, Math.round(rating)));

    return (
        <span className="inline-flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
                <Star
                    key={`testimonial-star-${safeRating}-${index}`}
                    size={15}
                    className={
                        index < safeRating
                            ? "fill-amber-400 text-amber-500"
                            : "text-slate-300"
                    }
                />
            ))}
        </span>
    );
}

export default async function HomePage() {
    await connectDB();

    const [confirmedBookingsCount, locations, reviewStats, testimonialsRaw] = await Promise.all([
        Booking.countDocuments({ status: "confirmed" }),
        Property.find().select("location").lean(),
        Review.aggregate([
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]),
        Review.find()
            .populate("renter", "name")
            .populate("host", "name")
            .populate("property", "title")
            .select("rating comment createdAt renter host property")
            .sort({ createdAt: -1 })
            .limit(6)
            .lean(),
    ]);

    const uniqueCities = new Set(
        locations
            .map((item) => getCityFromLocation(String(item.location || "")))
            .filter(Boolean)
    );

    const avgRatingRaw = Number(reviewStats[0]?.avgRating || 0);
    const totalReviews = Number(reviewStats[0]?.totalReviews || 0);
    const avgRating =
        totalReviews > 0 ? `${avgRatingRaw.toFixed(1)}/5` : "New";

    const highlights = [
        { label: "Verified stays", value: `${formatCount(confirmedBookingsCount)}+` },
        { label: "Cities covered", value: `${formatCount(uniqueCities.size)}+` },
        { label: "Average rating", value: avgRating },
    ];

    const testimonials = testimonialsRaw.map((item) => {
        const renter = item.renter as { name?: string } | null;
        const host = item.host as { name?: string } | null;
        const property = item.property as { title?: string } | null;

        return {
            id: String(item._id),
            rating: Number(item.rating || 0),
            comment: String(item.comment || ""),
            renterName: String(renter?.name || "Guest"),
            hostName: String(host?.name || "Host"),
            propertyTitle: String(property?.title || "Property"),
        };
    });

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-orange-50/40 text-slate-900">
            <section className="relative overflow-hidden bg-slate-950">
                <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-orange-500/35 blur-3xl" />
                <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-sky-500/35 blur-3xl" />
                <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:px-10 md:pb-24">
                    <div className="grid items-center gap-10 md:grid-cols-2">
                        <div>
                            <p className="mb-5 inline-flex rounded-full border border-orange-300/40 bg-orange-300/10 px-4 py-1 text-sm font-semibold text-orange-200">
                                Modern stays for modern travel
                            </p>
                            <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
                                Beautiful homes. Smooth booking. Zero stress.
                            </h1>
                            <p className="mt-5 max-w-xl text-base text-slate-300 md:text-lg">
                                Explore quality rentals with photos, essential amenities, and
                                host details you can trust before you reserve.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href="/auth/signup"
                                    className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
                                >
                                    Start Booking
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="rounded-full border border-slate-500 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-300"
                                >
                                    Become a Host
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur">
                            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-200">
                                Why guests choose us
                            </p>
                            <div className="space-y-3">
                                {valuePoints.map((point) => (
                                    <div
                                        key={point.title}
                                        className="rounded-xl border border-white/20 bg-gradient-to-r from-white/15 to-white/5 px-4 py-3"
                                    >
                                        <p className="text-sm font-bold text-white">
                                            {point.title}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-200">
                                            {point.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 grid gap-4 sm:grid-cols-3">
                        {highlights.map((item) => (
                            <div
                                key={item.label}
                                className="rounded-2xl border border-white/20 bg-gradient-to-b from-white/20 to-white/5 p-4 text-center backdrop-blur-sm"
                            >
                                <p className="text-2xl font-black text-white">{item.value}</p>
                                <p className="text-sm text-slate-200">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-6 py-14 md:px-10">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                            Featured listings
                        </p>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900">
                            Find your next stay
                        </h2>
                    </div>
                    <Link
                        href="/auth/login"
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
                    >
                        Login to book faster
                    </Link>
                </div>
                <PropertyGrid />
            </section>

            <section className="mx-auto max-w-7xl px-6 pb-14 md:px-10">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                            Renter testimonials
                        </p>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900">
                            What renters say about hosts
                        </h2>
                    </div>
                </div>

                {testimonials.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
                        No testimonials yet. Completed stays with reviews will appear here.
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {testimonials.map((item) => (
                            <article
                                key={item.id}
                                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-100/60 blur-xl" />
                                <div className="relative">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                            Verified stay
                                        </div>
                                        {renderStars(item.rating)}
                                    </div>
                                </div>
                                <p className="relative mt-3 line-clamp-4 text-sm leading-relaxed text-slate-700">
                                    "{item.comment}"
                                </p>
                                <div className="relative mt-4 border-t border-slate-200 pt-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Renter
                                    </p>
                                    <p className="text-sm font-bold text-slate-900">{item.renterName}</p>
                                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Host
                                    </p>
                                    <p className="text-sm font-bold text-slate-900">{item.hostName}</p>
                                    <p className="mt-2 text-xs text-slate-600">
                                        Stay: {item.propertyTitle}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="border-y border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
                    <div className="grid gap-5 md:grid-cols-3">
                        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                            <h3 className="text-xl font-bold">Browse and compare</h3>
                            <p className="mt-3 text-slate-600">
                                Open any featured home to view photos, location, host profile,
                                and full pricing details.
                            </p>
                        </article>
                        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                            <h3 className="text-xl font-bold">Sign in to reserve</h3>
                            <p className="mt-3 text-slate-600">
                                Guests can explore freely. Booking actions are available after
                                login for secure reservations.
                            </p>
                        </article>
                        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                            <h3 className="text-xl font-bold">Host in minutes</h3>
                            <p className="mt-3 text-slate-600">
                                List your property, upload images, and start receiving booking
                                requests from your dashboard.
                            </p>
                        </article>
                    </div>
                </div>
            </section>
        </main>
    );
}
