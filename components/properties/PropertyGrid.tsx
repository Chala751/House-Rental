"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PropertyGrid() {
    const [properties, setProperties] = useState<any[]>([]);

    useEffect(() => {
        fetch("/api/properties")
            .then((res) => res.json())
            .then(setProperties);
    }, []);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {properties.map((p) => (
                <Link key={p._id} href={`/properties/${p._id}`}>
                    <div style={{ border: "1px solid #ddd", padding: 12 }}>
                        <h3>{p.title}</h3>
                        <p>{p.location}</p>
                        <p>${p.pricePerNight} / night</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
