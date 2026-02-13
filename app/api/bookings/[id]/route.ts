import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import Booking from "@/models/Booking";

function getStartOfDay(value: Date) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
}

export async function GET(
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
        const user = await User.findById(userId).select("role");
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (user.role !== "renter" && user.role !== "both") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const booking = await Booking.findOne({ _id: id, renter: user._id })
            .populate("property", "title location images pricePerNight")
            .populate("host", "name");

        if (!booking) {
            return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        }

        return NextResponse.json(booking);
    } catch (error) {
        console.error("Fetch booking failed:", error);
        return NextResponse.json(
            { message: "Failed to fetch booking" },
            { status: 500 }
        );
    }
}

export async function PATCH(
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
        const user = await User.findById(userId).select("role");
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        if (user.role !== "renter" && user.role !== "both") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;
        const payload = await req.json();
        if (payload?.action !== "cancel") {
            return NextResponse.json(
                { message: "Only cancel action is supported" },
                { status: 400 }
            );
        }

        const booking = await Booking.findOne({ _id: id, renter: user._id });
        if (!booking) {
            return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        }

        if (booking.status === "cancelled") {
            return NextResponse.json(
                { message: "Booking is already cancelled" },
                { status: 400 }
            );
        }

        const today = getStartOfDay(new Date());
        const checkIn = getStartOfDay(new Date(booking.checkIn));
        if (checkIn <= today) {
            return NextResponse.json(
                { message: "Booking cannot be cancelled on or after check-in date" },
                { status: 400 }
            );
        }

        booking.status = "cancelled";
        await booking.save();

        const updatedBooking = await Booking.findById(booking._id)
            .populate("property", "title location images pricePerNight")
            .populate("host", "name");

        return NextResponse.json(updatedBooking);
    } catch (error) {
        console.error("Cancel booking failed:", error);
        return NextResponse.json(
            { message: "Failed to update booking" },
            { status: 500 }
        );
    }
}
