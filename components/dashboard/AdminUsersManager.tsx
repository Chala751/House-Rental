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
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-xl font-black text-slate-900">User management</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Search accounts and delete users you want to remove.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={fetchUsers}
                    className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-500"
                >
                    Refresh
                </button>
            </div>

            <div className="mt-4">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, email, or role"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
            </div>

            {error && (
                <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                </p>
            )}

            <div className="mt-4 space-y-2">
                {loading && (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                        Loading users...
                    </p>
                )}

                {!loading && filteredUsers.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
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
                                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-4 py-3"
                            >
                                <div className="flex min-w-[260px] flex-1 items-center gap-3">
                                    <ProfileAvatar
                                        name={item.name}
                                        imageUrl={item.profileImage}
                                        size="sm"
                                        ringClassName="ring-2 ring-slate-200"
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-slate-900">
                                            {String(item.name || "Unknown user")}
                                        </p>
                                        <p className="truncate text-xs text-slate-600">
                                            {String(item.email || "-")}
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                            <span className="rounded-full bg-slate-200 px-2 py-0.5 font-semibold text-slate-700">
                                                {String(item.role || "renter")}
                                            </span>
                                            <span className="rounded-full bg-cyan-100 px-2 py-0.5 font-semibold text-cyan-700">
                                                Joined {formatDate(item.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={isCurrentUser || isDeleting}
                                    onClick={() => setConfirmUserId(id)}
                                    className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                                    title={isCurrentUser ? "You cannot delete your own account here." : "Delete user"}
                                >
                                    {isCurrentUser ? "Current account" : isDeleting ? "Deleting..." : "Delete user"}
                                </button>
                            </div>
                        );
                    })}
            </div>

            {confirmUserId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
                        <h3 className="text-lg font-black text-slate-900">Delete user?</h3>
                        <p className="mt-2 text-sm text-slate-600">
                            Are you sure you want to delete this user account?
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            This action cannot be undone and will remove related data.
                        </p>

                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmUserId(null)}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirmed}
                                disabled={Boolean(pendingDeleteId)}
                                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
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
