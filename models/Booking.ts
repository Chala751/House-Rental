import { Schema, model, models } from "mongoose";

const BookingSchema = new Schema(
    {
        renter: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        property: {
            type: Schema.Types.ObjectId,
            ref: "Property",
            required: true,
        },

        host: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        checkIn: {
            type: Date,
            required: true,
        },

        checkOut: {
            type: Date,
            required: true,
        },

        nights: {
            type: Number,
            required: true,
            min: 1,
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "confirmed",
        },
    },
    { timestamps: true }
);

BookingSchema.index({ renter: 1, createdAt: -1 });
BookingSchema.index({ property: 1, checkIn: 1, checkOut: 1, status: 1 });

export default models.Booking || model("Booking", BookingSchema);
