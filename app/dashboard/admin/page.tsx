import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import BothDashboard from "@/components/dashboard/BothDashboard";

export default async function AdminDashboardPage() {
    await connectDB();

    const token = (await cookies()).get("auth_token")?.value;
    if (!token) {
        redirect("/auth/login?next=/dashboard/admin");
    }

    let user;
    try {
        const { userId } = verifyToken(token);
        user = await User.findById(userId).select("-password");
    } catch {
        redirect("/auth/login?next=/dashboard/admin");
    }

    if (!user) {
        redirect("/auth/login?next=/dashboard/admin");
    }

    if (user.role !== "both") {
        redirect("/dashboard");
    }

    return <BothDashboard user={user} />;
}
