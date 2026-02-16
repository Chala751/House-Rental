import HostDashboard from "./HostDashboard";
import RenterDashboard from "./RenterDashboard";

export default function BothDashboard({ user }: any) {
    // Render both server-side dashboards to avoid importing server-only
    // modules into a client bundle. This keeps DB code server-only.
    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-slate-950 px-6 py-5 text-white shadow-xl md:px-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
                    Admin dashboard
                </p>
                <h1 className="mt-2 text-2xl font-black md:text-3xl">
                    Unified control for host and renter operations
                </h1>
                <p className="mt-2 text-sm text-slate-200">
                    Review listings, track bookings, and manage both sides of the
                    marketplace from one view.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-white/10 px-3 py-1">Admin</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">Host</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">Renter</span>
                </div>
            </section>

            <div>
                <HostDashboard user={user} />
            </div>

            <div style={{ marginTop: 24 }}>
                <RenterDashboard user={user} />
            </div>
        </div>
    );
}
