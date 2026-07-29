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

function normalizeImageUrl(value: string | null) {
    if (!value) {
        return null;
    }

    const clean = value.trim();
    if (!clean) {
        return null;
    }

    if (clean.includes("imagekit.io") && !clean.includes("?tr=")) {
        return `${clean}?tr=w-400,h-280,c-at_max,q-80`;
    }

    return clean;
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
            .populate("renter", "name email profileImage")
            .populate("host", "name email")
            .populate("property", "title location images")
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
        <div>
            <div className="mx-auto w-full max-w-6xl px-5 md:px-8 space-y-8 py-8 md:py-10">
                <section className="relative overflow-hidden rounded-3xl border border-line bg-ink p-6 text-white shadow-xl md:p-8">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent-soft blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 left-10 h-52 w-52 rounded-full bg-positive-soft blur-3xl" />
                    <div className="relative flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
                                Admin dashboard
                            </p>
                            <h1 className="font-display font-semibold leading-[1.08] tracking-tight text-[clamp(2rem,1.3rem+2.2vw,2.9rem)] mt-2">
                                Platform control center, {user.name}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm text-ink-soft md:text-base">
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
                                    <p className="text-xs uppercase tracking-wide text-ink-soft">
                                        Admin account
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative mt-5 flex flex-wrap gap-3">
                        <Link
                            href="/dashboard"
                            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
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
                    <article className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                            Total users
                        </p>
                        <p className="font-display font-semibold leading-[1.08] tracking-tight mt-2 text-[1.9rem] text-ink">{totalUsers}</p>
                    </article>
                    <article className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                            Host accounts
                        </p>
                        <p className="font-display font-semibold leading-[1.08] tracking-tight mt-2 text-[1.9rem] text-ink">{totalHosts}</p>
                    </article>
                    <article className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                            Renter accounts
                        </p>
                        <p className="font-display font-semibold leading-[1.08] tracking-tight mt-2 text-[1.9rem] text-ink">{totalRenters}</p>
                    </article>
                    <article className="rounded-2xl border border-positive bg-positive-soft p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-positive">
                            Confirmed bookings
                        </p>
                        <p className="font-display font-semibold leading-[1.08] tracking-tight mt-2 text-[1.9rem] text-positive">{confirmedBookings}</p>
                    </article>
                </section>

                <section className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <AdminUsersManager currentUserId={String(user._id)} />
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                            <h2 className="font-display font-semibold leading-[1.08] tracking-tight text-[1.35rem] text-ink">Platform totals</h2>
                            <div className="mt-4 space-y-2 text-sm">
                                <p className="rounded-lg bg-sunken px-3 py-2 text-ink-soft">
                                    Listings: <strong>{totalProperties}</strong>
                                </p>
                                <p className="rounded-lg bg-sunken px-3 py-2 text-ink-soft">
                                    Bookings: <strong>{totalBookings}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
                            <h2 className="font-display font-semibold leading-[1.08] tracking-tight text-[1.35rem] text-ink">Recent bookings</h2>
                            <div className="mt-4 space-y-3">
                                {bookings.slice(0, 6).map((item) => {
                                    const property = item.property as {
                                        title?: string;
                                        images?: string[];
                                    } | null;
                                    const renter = item.renter as {
                                        name?: string;
                                        profileImage?: string;
                                    } | null;

                                    const propertyImage = normalizeImageUrl(
                                        Array.isArray(property?.images)
                                            ? String(property.images[0] || "")
                                            : null
                                    );

                                    return (
                                        <div
                                            key={String(item._id)}
                                            className="rounded-xl border border-line p-3"
                                        >
                                            <div className="flex items-start gap-3">
                                                {propertyImage ? (
                                                    <img
                                                        src={propertyImage}
                                                        alt={String(property?.title || "Property")}
                                                        className="h-12 w-12 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-lg bg-sunken" />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="line-clamp-1 text-sm font-bold text-ink">
                                                        {String(property?.title || "Property")}
                                                    </p>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        <ProfileAvatar
                                                            name={String(renter?.name || "Unknown")}
                                                            imageUrl={renter?.profileImage}
                                                            size="sm"
                                                            ringClassName="ring-1 ring-line"
                                                        />
                                                        <p className="line-clamp-1 text-xs text-ink-soft">
                                                            Renter: {String(renter?.name || "Unknown")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="mt-1 text-xs text-ink-soft">
                                                {formatDate(String(item.checkIn))} - {formatDate(String(item.checkOut))}
                                            </p>
                                            <p className="mt-1 text-xs font-semibold text-ink-soft">
                                                ${new Intl.NumberFormat("en-US").format(Number(item.totalPrice || 0))}
                                            </p>
                                        </div>
                                    );
                                })}
                                {bookings.length === 0 && (
                                    <p className="text-sm text-ink-soft">No bookings found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
