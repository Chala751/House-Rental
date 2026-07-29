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
            <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
                className="group flex items-center gap-2.5 rounded-full border border-line bg-surface py-1 pl-1 pr-3 transition-colors hover:border-line-strong disabled:cursor-not-allowed disabled:opacity-60"
                title="Change profile photo"
            >
                <ProfileAvatar
                    name={user.name}
                    imageUrl={user.profileImage}
                    size="sm"
                    ringClassName="ring-1 ring-line"
                />
                <span className="hidden text-left sm:block">
                    <span className="block max-w-[120px] truncate text-[0.8125rem] font-medium text-ink">
                        {isUploading ? "Uploading…" : user.name}
                    </span>
                    <span className="block text-[10px] uppercase tracking-[0.1em] text-ink-muted">
                        {user.role || "member"}
                    </span>
                </span>
            </button>
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            {error && (
                <p className="absolute -bottom-5 right-0 text-[10px] font-medium text-critical">
                    {error}
                </p>
            )}
        </div>
    );
}
