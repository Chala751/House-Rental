import CreatePropertyForm from "@/components/properties/CreatePropertyForm";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";

type HostUser = {
    _id: string;
    name: string;
};

type HostDashboardProps = {
    user: HostUser;
};

export default async function HostDashboard({ user }: HostDashboardProps) {
    await connectDB();

    const listings = await Property.find({ host: user._id })
        .sort({ createdAt: -1 })
        .lean();

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

    return (
        <div className="h-full overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 md:px-8">
                <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white md:p-8">
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
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <article className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Total listings
                        </p>
                        <p className="mt-2 text-3xl font-black text-slate-900">
                            {listingCount}
                        </p>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Avg. nightly rate
                        </p>
                        <p className="mt-2 text-3xl font-black text-slate-900">
                            ${avgPrice}
                        </p>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Total guest capacity
                        </p>
                        <p className="mt-2 text-3xl font-black text-slate-900">
                            {totalCapacity}
                        </p>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                            <h2 className="text-xl font-black text-slate-900">Your listings</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Recent properties first.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {listingCount === 0 && (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                                    No listings yet. Create your first property using the form.
                                </div>
                            )}

                            {listings.map((listing) => (
                                <article
                                    key={String(listing._id)}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    {Array.isArray(listing.images) && listing.images[0] ? (
                                        <img
                                            src={String(listing.images[0])}
                                            alt={String(listing.title)}
                                            className="mb-4 h-40 w-full rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="mb-4 h-40 w-full rounded-xl bg-gradient-to-br from-orange-100 via-amber-50 to-sky-100" />
                                    )}
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">
                                                {listing.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-slate-600">
                                                {listing.location}
                                            </p>
                                        </div>
                                        <p className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800">
                                            ${listing.pricePerNight}/night
                                        </p>
                                    </div>
                                    <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                                        {listing.description}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                                        {typeof listing.bedrooms === "number" && (
                                            <span className="rounded-full bg-slate-100 px-2 py-1">
                                                {listing.bedrooms} bd
                                            </span>
                                        )}
                                        {typeof listing.bathrooms === "number" && (
                                            <span className="rounded-full bg-slate-100 px-2 py-1">
                                                {listing.bathrooms} ba
                                            </span>
                                        )}
                                        {typeof listing.maxGuests === "number" && (
                                            <span className="rounded-full bg-slate-100 px-2 py-1">
                                                {listing.maxGuests} guests
                                            </span>
                                        )}
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
