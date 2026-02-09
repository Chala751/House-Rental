import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

export async function GET() {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
        return NextResponse.json(null, { status: 401 });
    }

    try {
        const { userId } = verifyToken(token);
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return NextResponse.json(null, { status: 401 });
        }

        return NextResponse.json(user);
    } catch {
        return NextResponse.json(null, { status: 401 });
    }
}
