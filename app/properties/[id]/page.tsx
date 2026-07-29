import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import User from "@/models/User";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import BookingPanel from "@/components/properties/BookingPanel";

export default async function PropertyPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    await connectDB();

    const property = await Property.findById(id).populate("host", "name");
    const token = (await cookies()).get("auth_token")?.value;
    let isSignedIn = false;
    let canBook = false;

    if (token) {
        try {
            const { userId } = verifyToken(token);
            isSignedIn = true;
            const user = await User.findById(userId).select("role");
            canBook = !!user && (user.role === "renter" || user.role === "both");
        } catch {
            isSignedIn = false;
            canBook = false;
        }
    }

    if (!property) {
        return (
            <div className="mx-auto w-full max-w-6xl px-5 md:px-8 py-24 text-center">
                <h1 className="font-display font-semibold leading-[1.08] tracking-tight text-[clamp(1.5rem,1.15rem+1.1vw,1.95rem)] text-ink">Property not found</h1>
                <p className="text-[1.0625rem] leading-relaxed text-ink-soft mx-auto mt-3 max-w-md">
                    This listing may have been removed by its host.
                </p>
                <Link href="/" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 px-5 py-2.5 text-sm bg-accent text-white shadow-card hover:bg-accent-hover mt-7">
                    Browse other stays
                </Link>
            </div>
        );
    }

    const images =
        Array.isArray(property.images) && property.images.length > 0
            ? property.images
            : [];

    const amenities =
        Array.isArray(property.amenities) && property.amenities.length > 0
            ? property.amenities
            : [];

    const price = Number(property.pricePerNight || 0);

    const details = [
        { label: "Bedrooms", value: property.bedrooms },
        { label: "Bathrooms", value: property.bathrooms },
        { label: "Guests", value: property.maxGuests },
    ].filter((item) => typeof item.value === "number");

    return (
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8 py-10 md:py-14">
            <nav className="mb-6 text-sm text-ink-muted">
                <Link href="/" className="transition-colors hover:text-accent">
                    Stays
                </Link>
                <span className="mx-2" aria-hidden="true">
                    /
                </span>
                <span className="text-ink-soft">{String(property.location)}</span>
            </nav>

            {/* Title ---------------------------------------------------- */}
            <header className="mb-7">
                <h1 className="font-display font-semibold leading-[1.08] tracking-tight text-[clamp(2rem,1.3rem+2.2vw,2.9rem)] text-ink">
                    {String(property.title)}
                </h1>
                <p className="mt-2.5 text-[0.95rem] text-ink-soft">
                    {String(property.location)} · Hosted by{" "}
                    <span className="text-ink">
                        {String(property.host?.name || "Unknown host")}
                    </span>
                </p>
            </header>

            {/* Gallery -------------------------------------------------- */}
            <section
                className="grid gap-2.5 overflow-hidden rounded-3xl md:grid-cols-3 md:grid-rows-2"
                aria-label="Property photos"
            >
                <div className="relative md:col-span-2 md:row-span-2">
                    {images[0] ? (
                        <img
                            src={String(images[0])}
                            alt={String(property.title)}
                            className="block w-full bg-sunken object-cover h-[280px] rounded-2xl md:h-full md:min-h-[440px]"
                        />
                    ) : (
                        <div className="flex h-[280px] items-center justify-center rounded-2xl bg-sunken md:h-full md:min-h-[440px]">
                            <span className="text-sm text-ink-muted">No photos yet</span>
                        </div>
                    )}
                    {images.length > 0 && (
                        <span className="absolute bottom-3.5 left-3.5 rounded-full bg-ink/75 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                            {images.length} photo{images.length === 1 ? "" : "s"}
                        </span>
                    )}
                </div>

                {[1, 2].map((index) => {
                    const image = images[index];
                    return image ? (
                        <img
                            key={`${String(property._id)}-side-${index}`}
                            src={String(image)}
                            alt={`${String(property.title)} — photo ${index + 1}`}
                            loading="lazy"
                            className="block w-full bg-sunken object-cover h-[140px] rounded-2xl md:h-full"
                        />
                    ) : (
                        <div
                            key={`${String(property._id)}-side-fallback-${index}`}
                            className="h-[140px] w-full rounded-2xl bg-sunken md:h-full"
                        />
                    );
                })}
            </section>

            {/* Body ----------------------------------------------------- */}
            <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
                <div>
                    <section>
                        <h2 className="font-display font-semibold leading-[1.08] tracking-tight text-[clamp(1.5rem,1.15rem+1.1vw,1.95rem)] text-ink">About this home</h2>
                        <p className="mt-4 whitespace-pre-line text-[0.975rem] leading-[1.75] text-ink-soft">
                            {String(property.description)}
                        </p>
                    </section>

                    {details.length > 0 && (
                        <section className="mt-10 border-t border-line pt-8">
                            <h2 className="font-display font-semibold leading-[1.08] tracking-tight text-[clamp(1.5rem,1.15rem+1.1vw,1.95rem)] text-ink">
                                Property details
                            </h2>
                            <dl className="mt-5 grid grid-cols-3 gap-4">
                                {details.map((item) => (
                                    <div key={item.label}>
                                        <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ink-muted">
                                            {item.label}
                                        </dt>
                                        <dd className="font-display font-semibold leading-[1.08] tracking-tight mt-1.5 text-[1.6rem] text-ink">
                                            {String(item.value)}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                    )}

                    {amenities.length > 0 && (
                        <section className="mt-10 border-t border-line pt-8">
                            <h2 className="font-display font-semibold leading-[1.08] tracking-tight text-[clamp(1.5rem,1.15rem+1.1vw,1.95rem)] text-ink">
                                What this place offers
                            </h2>
                            <ul className="mt-5 flex flex-wrap gap-2.5">
                                {amenities.map((item: string) => (
                                    <li key={item} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-sunken px-2.5 py-1 text-[0.78rem] text-ink-soft">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <BookingPanel
                    propertyId={String(property._id)}
                    nightlyRate={price}
                    hostName={String(property.host?.name || "Unknown host")}
                    isSignedIn={isSignedIn}
                    canBook={canBook}
                />
            </div>
        </div>
    );
}
