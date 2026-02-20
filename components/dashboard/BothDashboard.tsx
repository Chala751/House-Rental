import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Property from "@/models/Property";
import Booking from "@/models/Booking";
import AdminUsersManager from "./AdminUsersManager";
import ProfileAvatar from "@/components/layout/ProfileAvatar";

type AdminUser = {
    _id: string;
    name: string;
    role: string;
    email: string;
    profileImage?: string;
};

type BothDashboardProps = {
    user: AdminUser;
};

function formatDate(value: Date | string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}

export default async function BothDashboard({ user }: BothDashboardProps) {
    await connectDB();

    const [users, properties, bookings] = await Promise.all([
        User.find().select("name email role createdAt").sort({ createdAt: -1 }).lean(),
        Property.find()
            .select("title location pricePerNight createdAt")
            .populate("host", "name email")
            .sort({ createdAt: -1 })
            .lean(),
        Booking.find()
            .select("checkIn checkOut totalPrice status createdAt")
            .populate("renter", "name email")
            .populate("host", "name email")
            .populate("property", "title location")
            .sort({ createdAt: -1 })
            .lean(),
    ]);

    const totalUsers = users.length;
    const totalHosts = users.filter((item) => item.role === "host" || item.role === "both").length;
    const totalRenters = users.filter((item) => item.role === "renter" || item.role === "both").length;
    const totalProperties = properties.length;
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter((item) => item.status === "confirmed").length;

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 via-white to-cyan-50/30">
            <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 md:px-8">
                <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl md:p-8">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-500/30 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-10 h-52 w-52 rounded-full bg-emerald-500/20 blur-3xl" />
                    <div className="relative flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
                                Admin dashboard
                            </p>
                            <h1 className="mt-2 text-3xl font-black md:text-4xl">
                                Platform control center, {user.name}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm text-slate-200 md:text-base">
                                Access all users, listings, and reservations from one place.
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
                                        Admin account
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative mt-5 flex flex-wrap gap-3">
                        <Link
                            href="/dashboard"
                            className="rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-400"
                        >
                            Main dashboard
                        </Link>
                        <Link
                            href="/api/admin/users"
                            className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/40"
                        >
                            Users API route
                        </Link>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Total users
                        </p>
                        <p className="mt-2 text-3xl font-black text-slate-900">{totalUsers}</p>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Host accounts
                        </p>
                        <p className="mt-2 text-3xl font-black text-slate-900">{totalHosts}</p>
                    </article>
                    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Renter accounts
                        </p>
                        <p className="mt-2 text-3xl font-black text-slate-900">{totalRenters}</p>
                    </article>
                    <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                            Confirmed bookings
                        </p>
                        <p className="mt-2 text-3xl font-black text-emerald-700">{confirmedBookings}</p>
                    </article>
                </section>

                <section className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <AdminUsersManager currentUserId={String(user._id)} />
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900">Platform totals</h2>
                            <div className="mt-4 space-y-2 text-sm">
                                <p className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700">
                                    Listings: <strong>{totalProperties}</strong>
                                </p>
                                <p className="rounded-lg bg-slate-100 px-3 py-2 text-slate-700">
                                    Bookings: <strong>{totalBookings}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-xl font-black text-slate-900">Recent bookings</h2>
                            <div className="mt-4 space-y-3">
                                {bookings.slice(0, 6).map((item) => {
                                    const property = item.property as { title?: string } | null;
                                    const renter = item.renter as { name?: string } | null;

                                    return (
                                        <div
                                            key={String(item._id)}
                                            className="rounded-xl border border-slate-200 p-3"
                                        >
                                            <p className="line-clamp-1 text-sm font-bold text-slate-900">
                                                {String(property?.title || "Property")}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-600">
                                                Renter: {String(renter?.name || "Unknown")}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-600">
                                                {formatDate(String(item.checkIn))} - {formatDate(String(item.checkOut))}
                                            </p>
                                            <p className="mt-1 text-xs font-semibold text-slate-700">
                                                ${new Intl.NumberFormat("en-US").format(Number(item.totalPrice || 0))}
                                            </p>
                                        </div>
                                    );
                                })}
                                {bookings.length === 0 && (
                                    <p className="text-sm text-slate-600">No bookings found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
