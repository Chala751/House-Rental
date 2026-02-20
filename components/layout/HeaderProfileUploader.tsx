"use client";

import { useEffect, useRef, useState } from "react";
import ProfileAvatar from "@/components/layout/ProfileAvatar";

type AuthUser = {
    name?: string;
    role?: string;
    profileImage?: string;
};

export default function HeaderProfileUploader() {
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");

    async function fetchUser() {
        try {
            const res = await fetch("/api/auth/me", { cache: "no-store" });
            if (!res.ok) {
                setUser(null);
                return;
            }
            const data = (await res.json()) as AuthUser;
            setUser(data);
        } catch {
            setUser(null);
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setError("");
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await fetch("/api/auth/profile-image", {
                method: "POST",
                body: formData,
            });

            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(payload?.message || "Failed to upload image.");
            }

            setUser((prev) => ({
                ...(prev || {}),
                profileImage: String(payload.profileImage || ""),
            }));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed.");
        } finally {
            setIsUploading(false);
            if (fileRef.current) {
                fileRef.current.value = "";
            }
        }
    }

    if (!user) {
        return null;
    }

    return (
        <div className="relative flex items-center gap-2">
            <ProfileAvatar
                name={user.name}
                imageUrl={user.profileImage}
                size="sm"
                ringClassName="ring-2 ring-slate-200"
            />
            <div className="hidden sm:block">
                <p className="max-w-[120px] truncate text-xs font-semibold text-slate-700">
                    {user.name}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-slate-500">
                    {user.role || "member"}
                </p>
            </div>
            <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
                className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isUploading ? "Uploading..." : "Upload"}
            </button>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            {error && (
                <p className="absolute -bottom-5 right-0 text-[10px] font-medium text-rose-600">
                    {error}
                </p>
            )}
        </div>
    );
}
