import Link from "next/link";
import PropertyGrid from "@/components/properties/PropertyGrid";

const highlights = [
  { label: "Verified stays", value: "2,400+" },
  { label: "Cities covered", value: "120+" },
  { label: "Average rating", value: "4.8/5" },
];

const steps = [
  {
    title: "Pick your dates",
    description:
      "Find short or long stays with flexible check-in options built for real travel plans.",
  },
  {
    title: "Book securely",
    description:
      "Message hosts, review details, and reserve your stay in minutes with clear pricing.",
  },
  {
    title: "Settle in",
    description:
      "From city lofts to family homes, arrive with confidence and everything ready.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-sky-100">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-8 md:px-10 md:pb-24">
          <header className="mb-16 flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-5 py-3 backdrop-blur-sm">
            <p className="text-lg font-bold tracking-tight">StayScape</p>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link href="/auth/login" className="hover:text-orange-700">
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
              >
                Sign up
              </Link>
            </nav>
          </header>

          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-orange-200 bg-white px-4 py-1 text-sm font-semibold text-orange-700">
                Trusted by renters and hosts
              </p>
              <h1 className="text-4xl font-black leading-tight md:text-6xl">
                Find a home that fits your next trip.
              </h1>
              <p className="mt-5 max-w-xl text-base text-slate-700 md:text-lg">
                Discover curated rentals with transparent pricing, verified
                hosts, and stays designed for work, family, and weekend
                escapes.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
                >
                  Start Booking
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold transition hover:border-slate-500"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur">
              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Quick start
              </p>
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  Location: Anywhere in the U.S.
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  Check-in: Flexible
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                  Guests: 1-8
                </div>
              </div>
              <button
                type="button"
                className="mt-5 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Explore Available Homes
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/70 bg-white/70 p-4 text-center backdrop-blur-sm"
              >
                <p className="text-2xl font-black text-slate-900">{item.value}</p>
                <p className="text-sm text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 md:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Featured listings
            </p>
            <h2 className="text-3xl font-black tracking-tight">Homes you can book now</h2>
          </div>
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
          >
            Login to save favorites
          </Link>
        </div>
        <PropertyGrid />
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-5 px-6 py-14 md:grid-cols-3 md:px-10">
          {steps.map((step) => (
            <article key={step.title} className="rounded-2xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="mt-3 text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
