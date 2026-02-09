"use client";

import { useState } from "react";
import HostDashboard from "./HostDashboard";
import RenterDashboard from "./RenterDashboard";

export default function BothDashboard({ user }: any) {
    const [tab, setTab] = useState<"host" | "renter">("host");

    return (
        <div>
            <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setTab("host")}>Host</button>
                <button onClick={() => setTab("renter")}>Renter</button>
            </div>

            {tab === "host" ? (
                <HostDashboard user={user} />
            ) : (
                <RenterDashboard user={user} />
            )}
        </div>
    );
}
