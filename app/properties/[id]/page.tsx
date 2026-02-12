import { connectDB } from "@/lib/mongodb";
import Property from "@/models/Property";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export default async function PropertyPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    await connectDB();

    const property = await Property.findById(id).populate(
        "host",
        "name"
    );
    const token = (await cookies()).get("auth_token")?.value;
    let isSignedIn = false;

    if (token) {
        try {
            verifyToken(token);
            isSignedIn = true;
        } catch {
            isSignedIn = false;
        }
    }

    if (!property) {
        return (
            <div className="mx-auto max-w-4xl px-6 py-16">
                <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-700">
                    Property not found.
                </p>
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
    const formattedPrice = new Intl.NumberFormat("en-US").format(price);

    return (
        <main className="bg-gradient-to-b from-slate-100 via-white to-slate-100">
            <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
                <section className="grid gap-3 md:grid-cols-5">
                    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:col-span-3">
                        {images[0] ? (
                            <img
                                src={String(images[0])}
                                alt={String(property.title)}
                                className="h-[320px] w-full object-cover md:h-[460px]"
                            />
                        ) : (
                            <div className="h-[320px] w-full bg-gradient-to-br from-orange-100 via-amber-50 to-sky-100 md:h-[460px]" />
                        )}
                        <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                            {images.length > 0 ? `${images.length} photo(s)` : "No photos yet"}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:col-span-2 md:grid-cols-1">
                        {[1, 2].map((index) => {
                            const image = images[index];
                            return image ? (
                                <img
                                    key={`${String(property._id)}-side-${index}`}
                                    src={String(image)}
                                    alt={`${String(property.title)} ${index + 1}`}
                                    className="h-[155px] w-full rounded-2xl border border-slate-200 object-cover shadow-sm md:h-[224px]"
                                />
                            ) : (
                                <div
                                    key={`${String(property._id)}-side-fallback-${index}`}
                                    className="h-[155px] w-full rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm md:h-[224px]"
                                />
                            );
                        })}
                    </div>
                </section>

                <section className="mt-6 grid gap-6 lg:grid-cols-3">
                    <div className="space-y-5 lg:col-span-2">
                        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                            <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-4xl">
                                {String(property.title)}
                            </h1>
                            <p className="mt-2 text-sm font-medium text-slate-500">
                                {String(property.location)}
                            </p>
                            <p className="mt-5 text-base leading-relaxed text-slate-700">
                                {String(property.description)}
                            </p>
                        </article>

                        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                            <h2 className="text-xl font-black text-slate-900">Property details</h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                                    Bedrooms: {typeof property.bedrooms === "number" ? property.bedrooms : "-"}
                                </p>
                                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                                    Bathrooms: {typeof property.bathrooms === "number" ? property.bathrooms : "-"}
                                </p>
                                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                                    Guests: {typeof property.maxGuests === "number" ? property.maxGuests : "-"}
                                </p>
                            </div>
                        </article>

                        {amenities.length > 0 && (
                            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                                <h2 className="text-xl font-black text-slate-900">Amenities</h2>
                                <div className="mt-4 flex flex-wrap gap-2.5">
                                    {amenities.map((item: string) => (
                                        <span
                                            key={item}
                                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </article>
                        )}
                    </div>

                    <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
                        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                            Nightly rate
                        </p>
                        <p className="mt-1 text-4xl font-black text-slate-900">${formattedPrice}</p>
                        <p className="mt-4 text-sm text-slate-600">
                            Hosted by {String(property.host?.name || "Unknown host")}
                        </p>

                        {!isSignedIn ? (
                            <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
                                <p className="text-sm font-semibold text-orange-700">
                                    To book this property, you must sign in.
                                </p>
                                <div className="mt-3 flex gap-2">
                                    <Link
                                        href="/auth/login"
                                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href="/auth/signup"
                                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
                                    >
                                        Create account
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                            >
                                Book this property
                            </button>
                        )}
                    </aside>
                </section>
            </div>
        </main>
    );
}
