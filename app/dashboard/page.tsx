import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

import HostDashboard from "@/components/dashboard/HostDashboard";
import RenterDashboard from "@/components/dashboard/RenterDashboard";

export default async function DashboardPage() {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        redirect("/auth/login");
    }

    let user;
    try {
        const { userId } = verifyToken(token);
        user = await User.findById(userId).select("-password");
    } catch {
        redirect("/auth/login");
    }

    if (!user) {
        redirect("/auth/login");
    }

    if (user.role === "host") {
        return <HostDashboard user={user} />;
    }

    if (user.role === "renter") {
        return <RenterDashboard user={user} />;
    }

    if (user.role === "both") {
        redirect("/dashboard/admin");
    }

    return null;
}
