import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { createToken, setAuthCookie } from "@/lib/auth";

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

    const token = createToken(user._id);
    setAuthCookie(token);

    return NextResponse.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    });
}
