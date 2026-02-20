import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import Property from "@/models/Property";
import Booking from "@/models/Booking";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
        }

        if (String(userId) === id) {
            return NextResponse.json(
                { message: "You cannot delete your own account here." },
                { status: 400 }
            );
        }

        const targetUser = await User.findById(id).select("_id");
        if (!targetUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const hostedProperties = await Property.find({ host: targetUser._id })
            .select("_id")
            .lean();
        const propertyIds = hostedProperties.map((item) => item._id);

        await Booking.deleteMany({
            $or: [
                { renter: targetUser._id },
                { host: targetUser._id },
                ...(propertyIds.length > 0 ? [{ property: { $in: propertyIds } }] : []),
            ],
        });

        await Property.deleteMany({ host: targetUser._id });
        await User.deleteOne({ _id: targetUser._id });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete admin user failed:", error);
        return NextResponse.json(
            { message: "Failed to delete user" },
            { status: 500 }
        );
    }
}
