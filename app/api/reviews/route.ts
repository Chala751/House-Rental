import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import Property from "@/models/Property";

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

        const { bookingId, rating, comment } = await req.json();

        if (!bookingId || !Types.ObjectId.isValid(String(bookingId))) {
            return NextResponse.json({ message: "Invalid bookingId" }, { status: 400 });
        }

        const numericRating = Number(rating);
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return NextResponse.json(
                { message: "Rating must be an integer between 1 and 5." },
                { status: 400 }
            );
        }

        const cleanComment = String(comment || "").trim();
        if (cleanComment.length < 3 || cleanComment.length > 500) {
            return NextResponse.json(
                { message: "Comment must be between 3 and 500 characters." },
                { status: 400 }
            );
        }

        const booking = await Booking.findById(bookingId).select(
            "renter host property status checkOut"
        );

        if (!booking) {
            return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        }

        if (String(booking.renter) !== String(user._id)) {
            return NextResponse.json(
                { message: "You can review only your own stays." },
                { status: 403 }
            );
        }

        if (booking.status !== "confirmed") {
            return NextResponse.json(
                { message: "Only confirmed bookings can be reviewed." },
                { status: 400 }
            );
        }

        const today = getStartOfDay(new Date());
        const checkOut = getStartOfDay(new Date(booking.checkOut));
        if (checkOut >= today) {
            return NextResponse.json(
                { message: "You can review after your stay is completed." },
                { status: 400 }
            );
        }

        const exists = await Review.exists({ booking: booking._id });
        if (exists) {
            return NextResponse.json(
                { message: "You have already reviewed this stay." },
                { status: 409 }
            );
        }

        const review = await Review.create({
            booking: booking._id,
            property: booking.property,
            host: booking.host,
            renter: booking.renter,
            rating: numericRating,
            comment: cleanComment,
        });

        const ratingSummary = await Review.aggregate([
            { $match: { property: booking.property } },
            {
                $group: {
                    _id: "$property",
                    avgRating: { $avg: "$rating" },
                    reviewCount: { $sum: 1 },
                },
            },
        ]);

        const avgRating = Number(ratingSummary[0]?.avgRating || 0);
        const reviewCount = Number(ratingSummary[0]?.reviewCount || 0);

        await Property.updateOne(
            { _id: booking.property },
            {
                $set: {
                    rating: Number(avgRating.toFixed(2)),
                    reviewCount,
                },
            }
        );

        return NextResponse.json(
            {
                _id: review._id,
                booking: review.booking,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create review failed:", error);
        return NextResponse.json(
            { message: "Failed to create review" },
            { status: 500 }
        );
    }
}
