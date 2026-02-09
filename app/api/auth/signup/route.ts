import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { createToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
    await connectDB();
    const { name, email, password, role } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
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

    const token = createToken(user._id);
    setAuthCookie(token);

    return NextResponse.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    });
}
