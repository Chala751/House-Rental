import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";

export async function GET(
    req: Request,
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
