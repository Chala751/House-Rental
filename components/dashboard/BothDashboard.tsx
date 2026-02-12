import HostDashboard from "./HostDashboard";
import RenterDashboard from "./RenterDashboard";

export default function BothDashboard({ user }: any) {
    // Render both server-side dashboards to avoid importing server-only
    // modules into a client bundle. This keeps DB code server-only.
    return (
        <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <button disabled>Host</button>
                <button disabled>Renter</button>
            </div>

            <div>
                <HostDashboard user={user} />
            </div>

            <div style={{ marginTop: 24 }}>
                <RenterDashboard user={user} />
            </div>
        </div>
    );
}
