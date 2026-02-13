import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Property from "@/models/Property";
import LogoutButton from "@/components/layout/LogoutButton";

type RenterUser = {
    _id: string;
    name: string;
};

type RenterDashboardProps = {
    user: RenterUser;
};

function formatDate(value: Date | string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}

function daysUntil(value: Date | string) {
    const oneDay = 1000 * 60 * 60 * 24;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const target = new Date(value);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - start.getTime()) / oneDay);
}

export default async function RenterDashboard({ user }: RenterDashboardProps) {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await Booking.find({ renter: user._id })
        .populate({
            path: "property",
            select: "title location pricePerNight images",
        })
        .sort({ createdAt: -1 })
        .lean();

    const suggestions = await Property.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .select("title location pricePerNight images")
        .populate("host", "name")
        .lean();

    const totalBookings = bookings.length;
    const upcomingBookings = bookings.filter(
        (booking) =>
            new Date(booking.checkIn) >= today &&
            (booking.status === "confirmed" || booking.status === "pending")
    );
    const completedStays = bookings.filter(
        (booking) => new Date(booking.checkOut) < today && booking.status === "confirmed"
    );
    const totalSpent = bookings.reduce(
        (sum, booking) => sum + Number(booking.totalPrice || 0),
        0
    );

    const totalSpentFormatted = new Intl.NumberFormat("en-US").format(totalSpent);

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-orange-50/30">
            <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 md:px-8">
                <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl md:p-8">
                    <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-orange-500/30 blur-3xl" />
                    <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-sky-500/30 blur-3xl" />
                    <p className="relative text-sm font-semibold uppercase tracking-widest text-orange-300">
                        Renter dashboard
                    </p>
                    <h1 className="relative mt-2 text-3xl font-black md:text-4xl">
                        Welcome back, {user.name}
                    </h1>
                    <p className="relative mt-3 max-w-2xl text-sm text-slate-200 md:text-base">
                        Track upcoming stays, manage your reservations, and discover
                        newly listed homes.
                    </p>
                    <div className="relative mt-5 flex flex-wrap gap-3">
                        <Link
                            href="/"
                            className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400"
                        >
                            Explore properties
                        </Link>
                        <LogoutButton />
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Total bookings
                        </p>
                        <p className="mt-2 text-3xl font-black text-slate-900">{totalBookings}</p>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Upcoming stays
                        </p>
                        <p className="mt-2 text-3xl font-black text-slate-900">
                            {upcomingBookings.length}
                        </p>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Completed stays
                        </p>
                        <p className="mt-2 text-3xl font-black text-slate-900">
                            {completedStays.length}
                        </p>
                    </article>
                    <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Total spent
                        </p>
                        <p className="mt-2 text-3xl font-black text-emerald-700">
                            ${totalSpentFormatted}
                        </p>
                    </article>
                </section>

                <section className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900">Upcoming stays</h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Confirmed and pending reservations from today onward.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {upcomingBookings.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                                    No upcoming stays yet. Browse listings and book your next trip.
                                </div>
                            )}

                            {upcomingBookings.map((booking) => {
                                const property = booking.property as {
                                    _id?: string;
                                    title?: string;
                                    location?: string;
                                    images?: string[];
                                } | null;
                                const image = Array.isArray(property?.images)
                                    ? property.images[0]
                                    : null;
                                const checkIn = new Date(booking.checkIn);
                                const startsIn = daysUntil(checkIn);

                                return (
                                    <article
                                        key={String(booking._id)}
                                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                    >
                                        <div className="grid md:grid-cols-[220px_1fr]">
                                            {image ? (
                                                <img
                                                    src={String(image)}
                                                    alt={String(property?.title || "Property")}
                                                    className="h-44 w-full object-cover md:h-full"
                                                />
                                            ) : (
                                                <div className="h-44 w-full bg-gradient-to-br from-orange-100 via-amber-50 to-sky-100 md:h-full" />
                                            )}
                                            <div className="p-5">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900">
                                                            {String(property?.title || "Property")}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-slate-600">
                                                            {String(
                                                                property?.location ||
                                                                    "Location not available"
                                                            )}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            booking.status === "confirmed"
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-amber-100 text-amber-700"
                                                        }`}
                                                    >
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-700">
                                                    <span className="rounded-full bg-slate-100 px-3 py-1">
                                                        {formatDate(booking.checkIn)} -{" "}
                                                        {formatDate(booking.checkOut)}
                                                    </span>
                                                    <span className="rounded-full bg-slate-100 px-3 py-1">
                                                        {Number(booking.nights || 0)} nights
                                                    </span>
                                                    <span className="rounded-full bg-slate-100 px-3 py-1">
                                                        Starts {startsIn <= 0 ? "today" : `in ${startsIn} days`}
                                                    </span>
                                                </div>
                                                {property?._id && (
                                                    <Link
                                                        href={`/properties/${String(property._id)}`}
                                                        className="mt-4 inline-flex text-sm font-semibold text-slate-900 underline-offset-4 hover:underline"
                                                    >
                                                        View property details
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900">Quick actions</h2>
                            <div className="mt-4 space-y-2">
                                <Link
                                    href="/"
                                    className="block rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
                                >
                                    Browse homes
                                </Link>
                                <Link
                                    href="/auth/login"
                                    className="block rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
                                >
                                    Switch account
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900">Recently listed</h2>
                            <div className="mt-4 space-y-3">
                                {suggestions.length === 0 && (
                                    <p className="text-sm text-slate-600">
                                        No listings available yet.
                                    </p>
                                )}

                                {suggestions.map((property) => {
                                    const image = Array.isArray(property.images)
                                        ? property.images[0]
                                        : null;
                                    const host = property.host as { name?: string } | null;
                                    return (
                                        <div
                                            key={String(property._id)}
                                            className="overflow-hidden rounded-xl border border-slate-200 transition hover:border-slate-300 hover:shadow-sm"
                                        >
                                            <Link href={`/properties/${String(property._id)}`} className="block">
                                            {image ? (
                                                <img
                                                    src={String(image)}
                                                    alt={String(property.title)}
                                                    className="h-28 w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-28 w-full bg-gradient-to-br from-orange-100 via-amber-50 to-sky-100" />
                                            )}
                                            <div className="p-3">
                                                <p className="line-clamp-1 text-sm font-bold text-slate-900">
                                                    {String(property.title)}
                                                </p>
                                                <p className="mt-1 line-clamp-1 text-xs text-slate-600">
                                                    {String(property.location)}
                                                </p>
                                                <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                                    Host: {String(host?.name || "Unknown host")}
                                                </p>
                                            </div>
                                            </Link>
                                            <div className="p-3 pt-0">
                                                <Link
                                                    href={`/properties/${String(property._id)}#book-panel`}
                                                    className="block rounded-lg bg-emerald-600 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-emerald-500"
                                                >
                                                    Book now
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-black text-slate-900">Booking history</h2>
                    <p className="mt-1 text-sm text-slate-600">Your latest reservations.</p>

                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="text-xs uppercase tracking-wide text-slate-500">
                                <tr className="border-b border-slate-200">
                                    <th className="px-2 py-3">Property</th>
                                    <th className="px-2 py-3">Dates</th>
                                    <th className="px-2 py-3">Status</th>
                                    <th className="px-2 py-3">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-2 py-5 text-sm text-slate-600"
                                        >
                                            No bookings yet.
                                        </td>
                                    </tr>
                                )}
                                {bookings.slice(0, 10).map((booking) => {
                                    const property = booking.property as {
                                        title?: string;
                                    } | null;
                                    return (
                                        <tr
                                            key={String(booking._id)}
                                            className="border-b border-slate-100"
                                        >
                                            <td className="px-2 py-3 font-medium text-slate-800">
                                                {String(property?.title || "Property")}
                                            </td>
                                            <td className="px-2 py-3 text-slate-600">
                                                {formatDate(booking.checkIn)} -{" "}
                                                {formatDate(booking.checkOut)}
                                            </td>
                                            <td className="px-2 py-3">
                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-2 py-3 font-semibold text-slate-800">
                                                $
                                                {new Intl.NumberFormat("en-US").format(
                                                    Number(booking.totalPrice || 0)
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
