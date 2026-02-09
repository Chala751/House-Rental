import { Schema, model, models } from "mongoose";

export type UserRole = "renter" | "host" | "both";

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        role: {
            type: String,
            enum: ["renter", "host", "both"],
            default: "renter",
        },

        savedProperties: [
            {
                type: Schema.Types.ObjectId,
                ref: "Property",
            },
        ],

        profileImage: String,
        bio: String,
    },
    { timestamps: true }
);

export default models.User || model("User", UserSchema);
