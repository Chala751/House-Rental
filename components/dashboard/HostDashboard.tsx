import CreatePropertyForm from "@/components/properties/CreatePropertyForm";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import { BedDouble, Bath, Users, MapPin, House, DollarSign } from "lucide-react";

type HostUser = {
    _id: string;
    name: string;
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

export default async function HostDashboard({ user }: HostDashboardProps) {
    await connectDB();

    const rawListings = (await Property.find({ host: user._id })
        .sort({ createdAt: -1 })
        .lean()) as RawListing[];

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

    const avgPriceFormatted = new Intl.NumberFormat("en-US").format(avgPrice);

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-orange-50/40">
            <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 md:px-8">
                <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl md:p-8">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-orange-500/30 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-10 h-52 w-52 rounded-full bg-sky-500/20 blur-3xl" />
                    <p className="relative text-sm font-semibold uppercase tracking-widest text-orange-300">
                        Host dashboard
                    </p>
                    <h1 className="relative mt-2 text-3xl font-black md:text-4xl">
                        Welcome back, {user.name}
                    </h1>
                    <p className="relative mt-3 max-w-2xl text-sm text-slate-200 md:text-base">
                        Manage your rental business from one place. Track your listings,
                        update pricing, and publish new homes quickly.
                    </p>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

                        <div className="grid gap-4 md:grid-cols-2">
                            {listingCount === 0 && (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 md:col-span-2">
                                    No listings yet. Create your first property using the form.
                                </div>
                            )}

                            {listings.map((listing) => (
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
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    {listing.title}
                                                </h3>
                                                <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600">
                                                    <MapPin size={14} />
                                                    {listing.location}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                                            {listing.description}
                                        </p>

                                        <div>
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
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
