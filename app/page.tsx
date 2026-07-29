import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import PropertyGrid from "@/components/properties/PropertyGrid";
import ProfileAvatar from "@/components/layout/ProfileAvatar";
import heroImage from "./luxury-realty-hero.jpg";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import "@/models/User";

const steps = [
    {
        step: "01",
        title: "Browse and compare",
        description:
            "Open any home to see full photography, the exact location, your host, and complete pricing before you commit.",
    },
    {
        step: "02",
        title: "Sign in to reserve",
        description:
            "Explore freely as a guest. Signing in unlocks booking, so every reservation is tied to a verified account.",
    },
    {
        step: "03",
        title: "Host in minutes",
        description:
            "List a property, upload your photos, and start receiving reservations from your dashboard the same day.",
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
        <span
            className="inline-flex items-center gap-0.5"
            aria-label={`${safeRating} out of 5 stars`}
        >
            {Array.from({ length: 5 }).map((_, index) => (
                <Star
                    key={`testimonial-star-${safeRating}-${index}`}
                    size={13}
                    aria-hidden="true"
                    className={
                        index < safeRating
                            ? "fill-accent text-accent"
                            : "text-line-strong"
                    }
                />
            ))}
        </span>
    );
}

export default async function HomePage() {
    await connectDB();

    const [confirmedBookingsCount, locations, reviewStats, testimonialsRaw] =
        await Promise.all([
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
                .populate("renter", "name profileImage")
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
    const avgRating = totalReviews > 0 ? avgRatingRaw.toFixed(1) : "New";

    const highlights = [
        { label: "Verified stays", value: formatCount(confirmedBookingsCount) },
        { label: "Cities covered", value: formatCount(uniqueCities.size) },
        { label: "Average rating", value: avgRating },
    ];

    const testimonials = testimonialsRaw.map((item) => {
        const renter = item.renter as { name?: string; profileImage?: string } | null;
        const host = item.host as { name?: string } | null;
        const property = item.property as { title?: string } | null;

        return {
            id: String(item._id),
            rating: Number(item.rating || 0),
            comment: String(item.comment || ""),
            renterName: String(renter?.name || "Guest"),
            renterImage: String(renter?.profileImage || ""),
            hostName: String(host?.name || "Host"),
            propertyTitle: String(property?.title || "Property"),
        };
    });

    return (
        <>
            {/* Hero ---------------------------------------------------- */}
            <section className="mx-auto w-full max-w-6xl px-5 md:px-8 pt-14 pb-16 md:pt-20 md:pb-24">
                <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Premium house rentals</p>
                        <h1 className="font-display font-semibold leading-[1.08] tracking-tight text-[clamp(2.6rem,1.4rem+3.6vw,4.25rem)] mt-5 text-ink">
                            Book beautiful homes
                            <span className="block text-accent">
                                without the booking stress.
                            </span>
                        </h1>
                        <p className="text-[1.0625rem] leading-relaxed text-ink-soft mt-6 max-w-lg">
                            Discover verified stays, meet trusted hosts, and read honest
                            guest feedback — all before you reserve your next trip.
                        </p>

                        <div className="mt-9 flex flex-wrap gap-3">
                            <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-5 py-2.5 text-sm bg-accent text-white shadow-card hover:bg-accent-hover">
                                Start booking
                            </Link>
                            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-5 py-2.5 text-sm border-line-strong bg-surface text-ink hover:border-ink-soft">
                                Become a host
                            </Link>
                        </div>

                        <dl className="mt-12 flex max-w-lg divide-x divide-line border-t border-line pt-7">
                            {highlights.map((item) => (
                                <div key={item.label} className="flex-1 pr-5 pl-5 first:pl-0">
                                    <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
                                        {item.label}
                                    </dt>
                                    <dd className="font-display font-semibold leading-[1.08] tracking-tight mt-2 text-[1.85rem] text-ink">
                                        {item.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className="relative">
                        <Image
                            src={heroImage}
                            alt="A sunlit living room in a StayScape rental home"
                            priority
                            placeholder="blur"
                            sizes="(min-width: 1024px) 50vw, 100vw"
                            className="h-[380px] w-full rounded-3xl object-cover shadow-float md:h-[520px]"
                        />
                        <div className="rounded-3xl border border-line bg-surface shadow-card absolute -bottom-6 left-6 right-6 flex items-center justify-between gap-4 p-4 shadow-float sm:left-8 sm:right-auto sm:w-[19rem]">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
                                    Live availability
                                </p>
                                <p className="mt-1 text-sm text-ink-soft">
                                    Real-time calendars, no double bookings
                                </p>
                            </div>
                            <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full bg-positive"
                                aria-hidden="true"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured listings --------------------------------------- */}
            <section id="stays" className="mx-auto w-full max-w-6xl px-5 md:px-8 scroll-mt-24 py-16 md:py-20">
                <div className="mb-9 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Featured listings</p>
                        <h2 className="font-display font-semibold leading-[1.08] tracking-tight text-[clamp(2rem,1.3rem+2.2vw,2.9rem)] mt-3 text-ink">
                            Find your next stay
                        </h2>
                    </div>
                    <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-4 py-2 text-[0.8125rem] border-line-strong bg-surface text-ink hover:border-ink-soft">
                        Log in to book faster
                    </Link>
                </div>
                <PropertyGrid />
            </section>

            {/* Testimonials -------------------------------------------- */}
            <section className="mx-auto w-full max-w-6xl px-5 md:px-8 py-16 md:py-20">
                <div className="mb-9 border-b border-line pb-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Guest reviews</p>
                    <h2 className="font-display font-semibold leading-[1.08] tracking-tight text-[clamp(2rem,1.3rem+2.2vw,2.9rem)] mt-3 text-ink">
                        What renters say about their hosts
                    </h2>
                </div>

                {testimonials.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-line-strong bg-surface p-12 text-center">
                        <p className="text-ink-soft">
                            No reviews yet — completed stays will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {testimonials.map((item) => (
                            <figure
                                key={item.id}
                                className="rounded-2xl border border-line bg-surface shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-soft flex flex-col p-6"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    {renderStars(item.rating)}
                                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-semibold border border-accent-line bg-accent-soft text-accent">Verified stay</span>
                                </div>

                                <blockquote className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">
                                    “{item.comment}”
                                </blockquote>

                                <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                                    <ProfileAvatar
                                        name={item.renterName}
                                        imageUrl={item.renterImage}
                                        size="sm"
                                        ringClassName="ring-1 ring-line"
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-ink">
                                            {item.renterName}
                                        </p>
                                        <p className="truncate text-xs text-ink-muted">
                                            {item.propertyTitle} · hosted by {item.hostName}
                                        </p>
                                    </div>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                )}
            </section>

            {/* How it works -------------------------------------------- */}
            <section className="mx-auto w-full max-w-6xl px-5 md:px-8 pb-4 md:pb-8">
                <div className="rounded-3xl border border-line bg-surface shadow-card overflow-hidden">
                    <div className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
                        {steps.map((item) => (
                            <article key={item.step} className="p-8 md:p-9">
                                <p className="font-display font-semibold leading-[1.08] tracking-tight text-[1.75rem] text-accent">
                                    {item.step}
                                </p>
                                <h3 className="mt-3 text-base font-semibold text-ink">
                                    {item.title}
                                </h3>
                                <p className="mt-2.5 text-[0.9rem] leading-relaxed text-ink-soft">
                                    {item.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
