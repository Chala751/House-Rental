import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { createToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    await connectDB();
    const { name, email, password, role } = await req.json();

    const exists = await User.findOne({ email });
    if (exists) {
        return NextResponse.json(
            { message: "Email already exists" },
            { status: 400 }
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
    });

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
