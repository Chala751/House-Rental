import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";

export default async function PropertyPage({
    params,
}: {
    params: { id: string };
}) {
    await connectDB();

    const property = await Property.findById(params.id).populate(
        "host",
        "name"
    );

    if (!property) {
        return <p>Property not found</p>;
    }

    return (
        <div>
            <h1>{property.title}</h1>
            <p>{property.description}</p>
            <p>{property.location}</p>
            <p>${property.pricePerNight} / night</p>
            <p>Hosted by {property.host.name}</p>
        </div>
    );
}
