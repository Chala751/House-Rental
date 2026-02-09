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

        nights: Number,

        totalPrice: Number,

        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "confirmed",
        },
    },
    { timestamps: true }
);

export default models.Booking || model("Booking", BookingSchema);
