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
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const payload = {
            ...form,
            pricePerNight: Number(form.pricePerNight),
            images: form.images.split(",").map((i) => i.trim()),
        };

        const res = await fetch("/api/properties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            alert("Failed to create property");
            return;
        }

        router.push("/dashboard");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create Property</h2>

            <input
                placeholder="Title"
                onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <textarea
                placeholder="Description"
                onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                }
            />

            <input
                placeholder="Location"
                onChange={(e) => setForm({ ...form, location: e.target.value })}
            />

            <input
                placeholder="Price per night"
                type="number"
                onChange={(e) =>
                    setForm({ ...form, pricePerNight: e.target.value })
                }
            />

            <input
                placeholder="Image URLs (comma separated)"
                onChange={(e) => setForm({ ...form, images: e.target.value })}
            />

            <button type="submit">Create</button>
        </form>
    );
}
