"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileAvatar from "@/components/layout/ProfileAvatar";

type AdminUserRecord = {
    _id: string;
    name?: string;
    email?: string;
    role?: "renter" | "host" | "both" | string;
    profileImage?: string;
    createdAt?: string;
};

type AdminUsersManagerProps = {
    currentUserId: string;
};

function formatDate(value?: string) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}

export default function AdminUsersManager({ currentUserId }: AdminUsersManagerProps) {
    const router = useRouter();
    const [users, setUsers] = useState<AdminUserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [confirmUserId, setConfirmUserId] = useState<string | null>(null);

    async function fetchUsers() {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/users", { cache: "no-store" });
            if (!res.ok) {
                throw new Error("Failed to fetch users");
            }
            const data = (await res.json()) as AdminUserRecord[];
            setUsers(Array.isArray(data) ? data : []);
        } catch {
            setError("Could not load users right now.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return users;
        return users.filter((item) => {
            const name = String(item.name || "").toLowerCase();
            const email = String(item.email || "").toLowerCase();
            const role = String(item.role || "").toLowerCase();
            return name.includes(term) || email.includes(term) || role.includes(term);
        });
    }, [query, users]);

    async function handleDeleteConfirmed() {
        if (!confirmUserId) {
            return;
        }

        setPendingDeleteId(confirmUserId);
        setError("");
        try {
            const res = await fetch(`/api/admin/users/${confirmUserId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload?.message || "Failed to delete user");
            }

            setUsers((prev) => prev.filter((item) => String(item._id) !== confirmUserId));
            setConfirmUserId(null);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not delete user.");
        } finally {
            setPendingDeleteId(null);
        }
    }

    return (
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="font-display font-semibold leading-[1.08] tracking-tight text-[1.35rem] text-ink">User management</h2>
                    <p className="mt-1 text-sm text-ink-soft">
                        Search accounts and delete users you want to remove.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={fetchUsers}
                    className="rounded-full border border-line-strong px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-soft transition hover:border-ink-soft"
                >
                    Refresh
                </button>
            </div>

            <div className="mt-4">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, email, or role"
                    className="w-full rounded-xl border border-line-strong bg-sunken px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft"
                />
            </div>

            {error && (
                <p className="mt-3 rounded-xl border border-critical bg-critical-soft px-3 py-2 text-sm text-critical">
                    {error}
                </p>
            )}

            <div className="mt-4 space-y-2">
                {loading && (
                    <p className="rounded-xl border border-dashed border-line-strong bg-sunken px-4 py-6 text-sm text-ink-soft">
                        Loading users...
                    </p>
                )}

                {!loading && filteredUsers.length === 0 && (
                    <p className="rounded-xl border border-dashed border-line-strong bg-sunken px-4 py-6 text-sm text-ink-soft">
                        No users found.
                    </p>
                )}

                {!loading &&
                    filteredUsers.map((item) => {
                        const id = String(item._id);
                        const isCurrentUser = id === currentUserId;
                        const isDeleting = pendingDeleteId === id;

                        return (
                            <div
                                key={id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-gradient-to-r from-white to-canvas px-4 py-3"
                            >
                                <div className="flex min-w-[260px] flex-1 items-center gap-3">
                                    <ProfileAvatar
                                        name={item.name}
                                        imageUrl={item.profileImage}
                                        size="sm"
                                        ringClassName="ring-2 ring-line"
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-ink">
                                            {String(item.name || "Unknown user")}
                                        </p>
                                        <p className="truncate text-xs text-ink-soft">
                                            {String(item.email || "-")}
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                            <span className="rounded-full bg-sunken px-2 py-0.5 font-semibold text-ink-soft">
                                                {String(item.role || "renter")}
                                            </span>
                                            <span className="rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent">
                                                Joined {formatDate(item.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={isCurrentUser || isDeleting}
                                    onClick={() => setConfirmUserId(id)}
                                    className="rounded-full bg-critical px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-critical disabled:cursor-not-allowed disabled:bg-sunken"
                                    title={isCurrentUser ? "You cannot delete your own account here." : "Delete user"}
                                >
                                    {isCurrentUser ? "Current account" : isDeleting ? "Deleting..." : "Delete user"}
                                </button>
                            </div>
                        );
                    })}
            </div>

            {confirmUserId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4">
                    <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-5 shadow-xl">
                        <h3 className="text-lg font-semibold text-ink">Delete user?</h3>
                        <p className="mt-2 text-sm text-ink-soft">
                            Are you sure you want to delete this user account?
                        </p>
                        <p className="mt-1 text-xs text-ink-muted">
                            This action cannot be undone and will remove related data.
                        </p>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmUserId(null)}
                                className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-semibold text-ink-soft transition hover:border-ink-soft"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirmed}
                                disabled={Boolean(pendingDeleteId)}
                                className="rounded-lg bg-critical px-3 py-2 text-sm font-semibold text-white transition hover:bg-critical disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {pendingDeleteId ? "Deleting..." : "Confirm delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
