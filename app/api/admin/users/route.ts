import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
    try {
        await connectDB();

        const token = (await cookies()).get("auth_token")?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { userId } = verifyToken(token);
        const requester = await User.findById(userId).select("role");

        if (!requester) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (requester.role !== "both") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Fetch admin users failed:", error);
        return NextResponse.json(
            { message: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
