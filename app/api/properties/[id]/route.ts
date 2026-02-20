import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import Property from "@/models/Property";
import Booking from "@/models/Booking";
import User from "@/models/User";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await connectDB();

    const property = await Property.findById(id).populate(
        "host",
        "name"
    );

    if (!property) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(property);
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        const token = (await cookies()).get("auth_token")?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { userId } = verifyToken(token);
        const user = await User.findById(userId).select("role");
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (user.role !== "host" && user.role !== "both") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const property = await Property.findById(id).select("host");
        if (!property) {
            return NextResponse.json({ message: "Property not found" }, { status: 404 });
        }

        if (String(property.host) !== String(userId)) {
            return NextResponse.json(
                { message: "You can delete only your own property." },
                { status: 403 }
            );
        }

        const hasBookings = await Booking.exists({
            property: property._id,
            status: { $ne: "cancelled" },
        });

        if (hasBookings) {
            return NextResponse.json(
                {
                    message:
                        "This property has bookings and cannot be deleted.",
                },
                { status: 409 }
            );
        }

        await Property.deleteOne({ _id: property._id });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete property failed:", error);
        return NextResponse.json(
            { message: "Failed to delete property" },
            { status: 500 }
        );
    }
}
