import Link from "next/link";
import PropertyGrid from "@/components/properties/PropertyGrid";

const highlights = [
    { label: "Verified stays", value: "2,400+" },
    { label: "Cities covered", value: "120+" },
    { label: "Average rating", value: "4.8/5" },
];

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

export default function HomePage() {
    return (
        <main className="min-h-screen bg-slate-100 text-slate-900">
            <section className="relative overflow-hidden bg-slate-950">
                <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-orange-500/30 blur-3xl" />
                <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl" />
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
                                        className="rounded-xl border border-white/20 bg-white/10 px-4 py-3"
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
                                className="rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm"
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
