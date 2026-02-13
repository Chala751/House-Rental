import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import Property from "@/models/Property";
import Booking from "@/models/Booking";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

function getStartOfDay(value: Date) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
}

export async function POST(req: Request) {
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

        const { propertyId, checkIn, checkOut } = await req.json();

        if (!propertyId || !checkIn || !checkOut) {
            return NextResponse.json(
                { message: "propertyId, checkIn, and checkOut are required" },
                { status: 400 }
            );
        }

        const property = await Property.findById(propertyId).select("host pricePerNight");
        if (!property) {
            return NextResponse.json({ message: "Property not found" }, { status: 404 });
        }

        const checkInDate = getStartOfDay(new Date(checkIn));
        const checkOutDate = getStartOfDay(new Date(checkOut));
        const today = getStartOfDay(new Date());

        if (
            Number.isNaN(checkInDate.getTime()) ||
            Number.isNaN(checkOutDate.getTime())
        ) {
            return NextResponse.json(
                { message: "Invalid check-in or check-out date" },
                { status: 400 }
            );
        }

        if (checkInDate < today) {
            return NextResponse.json(
                { message: "Check-in date cannot be in the past" },
                { status: 400 }
            );
        }

        const nights = Math.ceil(
            (checkOutDate.getTime() - checkInDate.getTime()) / ONE_DAY_MS
        );
        if (nights <= 0) {
            return NextResponse.json(
                { message: "Check-out must be after check-in" },
                { status: 400 }
            );
        }

        const hasConflict = await Booking.exists({
            property: property._id,
            status: { $in: ["pending", "confirmed"] },
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate },
        });

        if (hasConflict) {
            return NextResponse.json(
                { message: "Selected dates are not available" },
                { status: 409 }
            );
        }

        const totalPrice = nights * Number(property.pricePerNight || 0);

        const booking = await Booking.create({
            renter: user._id,
            property: property._id,
            host: property.host,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            nights,
            totalPrice,
            status: "confirmed",
        });

        const createdBooking = await Booking.findById(booking._id)
            .populate("property", "title location images pricePerNight")
            .populate("host", "name");

        return NextResponse.json(createdBooking, { status: 201 });
    } catch (error) {
        console.error("Create booking failed:", error);
        return NextResponse.json(
            { message: "Failed to create booking" },
            { status: 500 }
        );
    }
}

export async function GET() {
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

        const bookings = await Booking.find({ renter: user._id })
            .populate("property", "title location images pricePerNight")
            .populate("host", "name")
            .sort({ createdAt: -1 });

        return NextResponse.json(bookings);
    } catch (error) {
        console.error("Fetch bookings failed:", error);
        return NextResponse.json(
            { message: "Failed to fetch bookings" },
            { status: 500 }
        );
    }
}
