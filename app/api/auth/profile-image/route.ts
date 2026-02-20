import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import { getImageKit } from "@/lib/imagekit";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        await connectDB();

        const token = (await cookies()).get("auth_token")?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { userId } = verifyToken(token);
        const user = await User.findById(userId).select("_id name");
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const image = formData.get("image");

        if (!(image instanceof File) || image.size === 0) {
            return NextResponse.json(
                { message: "Profile image file is required." },
                { status: 400 }
            );
        }

        const maxFileSize = 5 * 1024 * 1024;
        if (image.size > maxFileSize) {
            return NextResponse.json(
                { message: "Image must be less than 5MB." },
                { status: 400 }
            );
        }

        if (!image.type.startsWith("image/")) {
            return NextResponse.json(
                { message: "Only image files are allowed." },
                { status: 400 }
            );
        }

        const imagekit = getImageKit();
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const cleanName = image.name.replace(/\s+/g, "-");
        const uploaded = await imagekit.upload({
            file: buffer,
            fileName: `profile-${user._id}-${Date.now()}-${cleanName}`,
            folder: "/house-rental/profiles",
        });

        await User.updateOne(
            { _id: user._id },
            { $set: { profileImage: uploaded.url } }
        );

        return NextResponse.json({ profileImage: uploaded.url });
    } catch (error) {
        console.error("Upload profile image failed:", error);
        return NextResponse.json(
            { message: "Failed to upload profile image" },
            { status: 500 }
        );
    }
}
