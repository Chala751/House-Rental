"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePropertyForm() {
    const router = useRouter();
    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        pricePerNight: "",
        images: "",
        amenities: "",
        bedrooms: "",
        bathrooms: "",
        maxGuests: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        const payload = {
            ...form,
            pricePerNight: Number(form.pricePerNight),
            images: form.images
                .split(",")
                .map((i) => i.trim())
                .filter(Boolean),
            amenities: form.amenities
                .split(",")
                .map((i) => i.trim())
                .filter(Boolean),
            bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
            bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
            maxGuests: form.maxGuests ? Number(form.maxGuests) : undefined,
        };

        try {
            const res = await fetch("/api/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                setError("Failed to create property. Please check your details.");
                return;
            }

            setSuccess("Property created successfully.");
            setForm({
                title: "",
                description: "",
                location: "",
                pricePerNight: "",
                images: "",
                amenities: "",
                bedrooms: "",
                bathrooms: "",
                maxGuests: "",
            });
            router.refresh();
        } catch {
            setError("Something went wrong. Try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="text-xl font-black text-slate-900">Create property</h2>
            <p className="mt-1 text-sm text-slate-600">
                Add listing details and publish instantly.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                    <label htmlFor="title" className="mb-1 block text-sm font-semibold text-slate-700">
                        Title
                    </label>
                    <input
                        id="title"
                        placeholder="Modern city apartment"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="description"
                        className="mb-1 block text-sm font-semibold text-slate-700"
                    >
                        Description
                    </label>
                    <textarea
                        id="description"
                        placeholder="Describe your place, neighborhood, and what guests can expect."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        required
                    />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label htmlFor="location" className="mb-1 block text-sm font-semibold text-slate-700">
                            Location
                        </label>
                        <input
                            id="location"
                            placeholder="Austin, TX"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="pricePerNight"
                            className="mb-1 block text-sm font-semibold text-slate-700"
                        >
                            Price per night ($)
                        </label>
                        <input
                            id="pricePerNight"
                            placeholder="150"
                            type="number"
                            min={1}
                            value={form.pricePerNight}
                            onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                            required
                        />
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                        <label htmlFor="bedrooms" className="mb-1 block text-sm font-semibold text-slate-700">
                            Bedrooms
                        </label>
                        <input
                            id="bedrooms"
                            type="number"
                            min={0}
                            placeholder="2"
                            value={form.bedrooms}
                            onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>
                    <div>
                        <label htmlFor="bathrooms" className="mb-1 block text-sm font-semibold text-slate-700">
                            Bathrooms
                        </label>
                        <input
                            id="bathrooms"
                            type="number"
                            min={0}
                            placeholder="1"
                            value={form.bathrooms}
                            onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>
                    <div>
                        <label htmlFor="maxGuests" className="mb-1 block text-sm font-semibold text-slate-700">
                            Max guests
                        </label>
                        <input
                            id="maxGuests"
                            type="number"
                            min={1}
                            placeholder="4"
                            value={form.maxGuests}
                            onChange={(e) => setForm({ ...form, maxGuests: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="amenities" className="mb-1 block text-sm font-semibold text-slate-700">
                        Amenities (comma separated)
                    </label>
                    <input
                        id="amenities"
                        placeholder="WiFi, Pool, Parking"
                        value={form.amenities}
                        onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                </div>

                <div>
                    <label htmlFor="images" className="mb-1 block text-sm font-semibold text-slate-700">
                        Image URLs (comma separated)
                    </label>
                    <input
                        id="images"
                        placeholder="https://..., https://..."
                        value={form.images}
                        onChange={(e) => setForm({ ...form, images: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                </div>

                {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {success}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? "Creating property..." : "Publish property"}
                </button>
            </form>
        </section>
    );
}
