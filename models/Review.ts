import { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema(
    {
        booking: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            unique: true,
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
        renter: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 500,
        },
    },
    { timestamps: true }
);

ReviewSchema.index({ host: 1, createdAt: -1 });
ReviewSchema.index({ property: 1, createdAt: -1 });
ReviewSchema.index({ renter: 1, createdAt: -1 });

export default models.Review || model("Review", ReviewSchema);
