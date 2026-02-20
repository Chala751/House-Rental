import CreatePropertyForm from "@/components/properties/CreatePropertyForm";
import HostListingsManager from "@/components/dashboard/HostListingsManager";
import ProfileAvatar from "@/components/layout/ProfileAvatar";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Review from "@/models/Review";
import Booking from "@/models/Booking";
import { Users, House, DollarSign, Star } from "lucide-react";

type HostUser = {
    _id: string;
    name: string;
    profileImage?: string;
};

type HostDashboardProps = {
    user: HostUser;
};

type RawListing = {
    _id: unknown;
    title?: string;
    description?: string;
    location?: string;
    pricePerNight?: number;
    bedrooms?: number;
    bathrooms?: number;
    maxGuests?: number;
    images?: string[];
};

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

function normalizeImageUrl(value: string | null) {
    if (!value) {
        return null;
    }

    const clean = value.trim();
    if (!clean) {
        return null;
    }

    if (clean.includes("imagekit.io") && !clean.includes("?tr=")) {
        return `${clean}?tr=w-1200,h-720,c-at_max,q-80`;
    }

    return clean;
}

function renderStars(rating: number) {
    const safe = Math.max(1, Math.min(5, Math.round(rating)));
    return (
        <span className="inline-flex items-center gap-0.5 align-middle">
            {Array.from({ length: 5 }).map((_, index) => (
                <Star
                    key={`host-star-${safe}-${index}`}
                    size={14}
                    className={
                        index < safe
                            ? "fill-amber-400 text-amber-500"
                            : "text-slate-300"
                    }
                />
            ))}
        </span>
    );
}

export default async function HostDashboard({ user }: HostDashboardProps) {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [rawListingsResult, hostReviews, hostBookings] = await Promise.all([
        Property.find({ host: user._id }).sort({ createdAt: -1 }).lean(),
        Review.find({ host: user._id })
            .populate("renter", "name")
            .populate("property", "title images")
            .sort({ createdAt: -1 })
            .select("rating comment createdAt renter property")
            .lean(),
        Booking.find({
            host: user._id,
            checkOut: { $gte: today },
            status: { $in: ["pending", "confirmed"] },
        })
            .populate("renter", "name email profileImage")
            .populate("property", "title location images")
            .sort({ checkIn: 1 })
            .select("checkIn checkOut nights totalPrice status renter property")
            .lean(),
    ]);

    const rawListings = rawListingsResult as RawListing[];

    const listings: Listing[] = rawListings.map((item) => {
        const firstImage =
            Array.isArray(item.images) && item.images.length > 0
                ? String(item.images[0])
                : null;

        return {
            id: String(item._id),
            title: String(item.title || "Untitled listing"),
            description: String(item.description || ""),
            location: String(item.location || "Location not provided"),
            pricePerNight: Number(item.pricePerNight || 0),
            bedrooms:
                typeof item.bedrooms === "number" ? Number(item.bedrooms) : undefined,
            bathrooms:
                typeof item.bathrooms === "number" ? Number(item.bathrooms) : undefined,
            maxGuests:
                typeof item.maxGuests === "number" ? Number(item.maxGuests) : undefined,
            imageUrl: normalizeImageUrl(firstImage),
        };
    });

    const listingCount = listings.length;
    const avgPrice =
        listingCount === 0
            ? 0
            : Math.round(
                  listings.reduce(
                      (sum, item) => sum + Number(item.pricePerNight || 0),
                      0
                  ) / listingCount
              );

    const totalCapacity = listings.reduce(
        (sum, item) => sum + Number(item.maxGuests || 0),
        0
    );

    const totalReviews = hostReviews.length;
    const avgHostRating =
        totalReviews === 0
            ? 0
            : Number(
                  (
                      hostReviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
                      totalReviews
                  ).toFixed(2)
              );

    const avgPriceFormatted = new Intl.NumberFormat("en-US").format(avgPrice);
    const upcomingStays = hostBookings.filter(
        (booking) =>
            new Date(booking.checkOut) >= today &&
            (booking.status === "pending" || booking.status === "confirmed")
    );
    const upcomingCount = upcomingStays.length;

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-orange-50/40">
            <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 md:px-8">
                <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl md:p-8">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-orange-500/30 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-10 h-52 w-52 rounded-full bg-sky-500/20 blur-3xl" />
                    <div className="relative flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-widest text-orange-300">
                                Host dashboard
                            </p>
                            <h1 className="mt-2 text-3xl font-black md:text-4xl">
                                Welcome back, {user.name}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm text-slate-200 md:text-base">
                                Manage your rental business from one place. Track your listings,
                                update pricing, and publish new homes quickly.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur">
                            <div className="flex items-center gap-3">
                                <ProfileAvatar
                                    name={user.name}
                                    imageUrl={user.profileImage}
                                    size="md"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-white">{user.name}</p>
                                    <p className="text-xs uppercase tracking-wide text-slate-200">
                                        Host account
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="inline-flex rounded-xl bg-slate-900 p-2 text-white">
                            <House size={16} />
                        </div>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Total listings
                        </p>
                        <p className="mt-2 text-3xl font-black text-slate-900">
                            {listingCount}
                        </p>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="inline-flex rounded-xl bg-emerald-600 p-2 text-white">
                            <DollarSign size={16} />
                        </div>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Avg. nightly rate
                        </p>
                        <p className="mt-2 text-3xl font-black text-slate-900">
                            ${avgPriceFormatted}
                        </p>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="inline-flex rounded-xl bg-sky-600 p-2 text-white">
                            <Users size={16} />
                        </div>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Total guest capacity
                        </p>
                        <p className="mt-2 text-3xl font-black text-slate-900">
                            {totalCapacity}
                        </p>
                    </article>
                    <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Listing status
                        </p>
                        <p className="mt-2 text-3xl font-black text-emerald-600">
                            Active
                        </p>
                    </article>
                    <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                            Upcoming stays
                        </p>
                        <p className="mt-2 text-3xl font-black text-sky-700">
                            {upcomingCount}
                        </p>
                    </article>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900">Upcoming guests</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Guests with pending or confirmed stays in your properties.
                    </p>

                    <div className="mt-4 space-y-3">
                        {upcomingStays.length === 0 && (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                                No upcoming guest stays right now.
                            </div>
                        )}

                        {upcomingStays.slice(0, 8).map((booking) => {
                            const renter = booking.renter as {
                                name?: string;
                                email?: string;
                                profileImage?: string;
                            } | null;
                            const property = booking.property as {
                                title?: string;
                                location?: string;
                                images?: string[];
                            } | null;
                            const propertyImage = normalizeImageUrl(
                                Array.isArray(property?.images)
                                    ? String(property.images[0] || "")
                                    : null
                            );

                            return (
                                <article
                                    key={String(booking._id)}
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            {propertyImage ? (
                                                <img
                                                    src={propertyImage}
                                                    alt={String(property?.title || "Property")}
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-100 via-amber-50 to-sky-100" />
                                            )}
                                            <div className="min-w-0">
                                                <p className="line-clamp-1 text-sm font-bold text-slate-900">
                                                    {String(property?.title || "Property")}
                                                </p>
                                                <p className="line-clamp-1 text-xs text-slate-600">
                                                    {String(property?.location || "Location not available")}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                booking.status === "confirmed"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-amber-100 text-amber-700"
                                            }`}
                                        >
                                            {String(booking.status)}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <ProfileAvatar
                                            name={String(renter?.name || "Guest")}
                                            imageUrl={renter?.profileImage}
                                            size="sm"
                                            ringClassName="ring-1 ring-slate-200"
                                        />
                                        <p className="text-sm font-semibold text-slate-800">
                                            {String(renter?.name || "Guest")}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {String(renter?.email || "")}
                                        </p>
                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-700">
                                        <span className="rounded-full bg-white px-2.5 py-1">
                                            {new Intl.DateTimeFormat("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            }).format(new Date(booking.checkIn))}
                                            {" - "}
                                            {new Intl.DateTimeFormat("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            }).format(new Date(booking.checkOut))}
                                        </span>
                                        <span className="rounded-full bg-white px-2.5 py-1">
                                            {Number(booking.nights || 0)} nights
                                        </span>
                                        <span className="rounded-full bg-white px-2.5 py-1">
                                            $
                                            {new Intl.NumberFormat("en-US").format(
                                                Number(booking.totalPrice || 0)
                                            )}
                                        </span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-3">
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
                        <h2 className="text-xl font-black text-slate-900">Host profile rating</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Based on reviews from completed stays.
                        </p>
                        <div className="mt-4 space-y-2">
                            <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
                                <span>Average rating: </span>
                                <strong className="inline-flex items-center gap-1">
                                    {totalReviews === 0
                                        ? "-"
                                        : (
                                            <>
                                                {renderStars(avgHostRating)}
                                                <span>({avgHostRating}/5)</span>
                                            </>
                                        )}
                                </strong>
                            </p>
                            <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
                                Total reviews: <strong>{totalReviews}</strong>
                            </p>
                        </div>
                    </article>

                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                        <h2 className="text-xl font-black text-slate-900">Recent renter reviews</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Latest comments from guests about your stays.
                        </p>
                        <div className="mt-4 space-y-3">
                            {hostReviews.length === 0 && (
                                <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                                    No reviews yet. Completed stays will start showing feedback here.
                                </p>
                            )}
                            {hostReviews.slice(0, 5).map((review) => {
                                const renter = review.renter as { name?: string } | null;
                                const property = review.property as { title?: string; images?: string[] } | null;
                                const propertyImage = Array.isArray(property?.images)
                                    ? normalizeImageUrl(String(property.images[0] || ""))
                                    : null;
                                return (
                                    <div
                                        key={String(review._id)}
                                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex min-w-0 items-center gap-2">
                                                {propertyImage ? (
                                                    <img
                                                        src={propertyImage}
                                                        alt={String(property?.title || "Property")}
                                                        className="h-10 w-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-100 via-amber-50 to-sky-100" />
                                                )}
                                                <p className="truncate text-sm font-bold text-slate-900">
                                                    {String(property?.title || "Property")}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                <span className="inline-flex items-center gap-1">
                                                    {renderStars(Number(review.rating || 0))}
                                                </span>
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500">
                                            By {String(renter?.name || "Guest")}
                                        </p>
                                        <p className="mt-2 text-sm text-slate-700">
                                            {String(review.comment || "")}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </article>
                </section>

                <section className="grid gap-6 lg:grid-cols-5">
                    <div className="lg:col-span-2">
                        <CreatePropertyForm />
                    </div>

                    <div className="space-y-4 lg:col-span-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900">Your listings</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Recent properties first.
                            </p>
                        </div>

                        <HostListingsManager listings={listings} />
                    </div>
                </section>
            </div>
        </div>
    );
}
