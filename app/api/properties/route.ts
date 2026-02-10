import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import Property from "@/models/Property";
import User from "@/models/User";

export async function POST(req: Request) {
    await connectDB();

    const token = (await cookies()).get("auth_token")?.value;
    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId } = verifyToken(token);
    const user = await User.findById(userId);

    if (!user || (user.role !== "host" && user.role !== "both")) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();

    const property = await Property.create({
        ...data,
        host: user._id,
    });

    return NextResponse.json(property, { status: 201 });
}

export async function GET() {
    await connectDB();

    const properties = await Property.find()
        .populate("host", "name")
        .sort({ createdAt: -1 });

    return NextResponse.json(properties);
}
