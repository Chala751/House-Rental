import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { getImageKit } from "@/lib/imagekit";
import Property from "@/models/Property";
import User from "@/models/User";

export const runtime = "nodejs";

function toOptionalNumber(value: FormDataEntryValue | null) {
    if (typeof value !== "string" || !value.trim()) {
        return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

export async function POST(req: Request) {
    try {
        await connectDB();

        const token = (await cookies()).get("auth_token")?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { userId } = verifyToken(token);
        const user = await User.findById(userId);

        if (!user || (user.role !== "host" && user.role !== "both")) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const formData = await req.formData();
        const title = formData.get("title");
        const description = formData.get("description");
        const location = formData.get("location");
        const pricePerNight = formData.get("pricePerNight");

        if (
            typeof title !== "string" ||
            typeof description !== "string" ||
            typeof location !== "string" ||
            typeof pricePerNight !== "string" ||
            !title.trim() ||
            !description.trim() ||
            !location.trim() ||
            !pricePerNight.trim()
        ) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const price = Number(pricePerNight);
        if (!Number.isFinite(price) || price <= 0) {
            return NextResponse.json(
                { message: "Invalid pricePerNight" },
                { status: 400 }
            );
        }

        const amenitiesRaw = formData.get("amenities");
        const amenities =
            typeof amenitiesRaw === "string"
                ? amenitiesRaw
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                : [];

        const imageFiles = formData
            .getAll("images")
            .filter((entry): entry is File => entry instanceof File && entry.size > 0);

        const imageUrlsRaw = formData.get("imageUrls");
        const externalImageUrls =
            typeof imageUrlsRaw === "string"
                ? imageUrlsRaw
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                : [];

        let uploadedImageUrls: string[] = [];
        if (imageFiles.length > 0) {
            const imagekit = getImageKit();
            const now = Date.now();

            uploadedImageUrls = await Promise.all(
                imageFiles.map(async (file, index) => {
                    const arrayBuffer = await file.arrayBuffer();
                    const fileBuffer = Buffer.from(arrayBuffer);
                    const cleanName = file.name.replace(/\s+/g, "-");

                    const uploaded = await imagekit.upload({
                        file: fileBuffer,
                        fileName: `property-${user._id}-${now}-${index}-${cleanName}`,
                        folder: "/house-rental/properties",
                    });

                    return uploaded.url;
                })
            );
        }

        const property = await Property.create({
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            pricePerNight: price,
            images: [...uploadedImageUrls, ...externalImageUrls],
            amenities,
            bedrooms: toOptionalNumber(formData.get("bedrooms")),
            bathrooms: toOptionalNumber(formData.get("bathrooms")),
            maxGuests: toOptionalNumber(formData.get("maxGuests")),
            host: user._id,
        });

        return NextResponse.json(property, { status: 201 });
    } catch (error) {
        console.error("Create property failed:", error);
        return NextResponse.json(
            { message: "Failed to create property" },
            { status: 500 }
        );
    }
}

export async function GET() {
    await connectDB();

    const properties = await Property.find()
        .populate("host", "name")
        .sort({ createdAt: -1 });

    return NextResponse.json(properties);
}
