import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { createToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return NextResponse.json(
            { message: "Invalid credentials" },
            { status: 401 }
        );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return NextResponse.json(
            { message: "Invalid credentials" },
            { status: 401 }
        );
    }

    const token = createToken(user._id.toString());

    const cookieStore = await cookies();
    cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    });
}
