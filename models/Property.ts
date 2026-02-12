import { Schema, model, models } from "mongoose";

const PropertySchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        location: {
            type: String,
            required: true,
        },

        pricePerNight: {
            type: Number,
            required: true,
        },

        images: {
            type: [String],
            default: [],
        },

        amenities: {
            type: [String],
            default: [],
        },

        bedrooms: Number,
        bathrooms: Number,
        maxGuests: Number,

        host: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        rating: {
            type: Number,
            default: 0,
        },

        reviewCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export default models.Property || model("Property", PropertySchema);
