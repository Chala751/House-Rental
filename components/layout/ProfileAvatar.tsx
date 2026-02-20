type ProfileAvatarProps = {
    name?: string;
    imageUrl?: string | null;
    size?: "sm" | "md" | "lg";
    ringClassName?: string;
};

const sizeClasses = {
    sm: "h-9 w-9 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-lg",
};

function getInitials(name?: string) {
    const value = String(name || "").trim();
    if (!value) {
        return "U";
    }

    const parts = value.split(/\s+/).slice(0, 2);
    return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "U";
}

export default function ProfileAvatar({
    name,
    imageUrl,
    size = "md",
    ringClassName = "ring-2 ring-white/80",
}: ProfileAvatarProps) {
    const src = String(imageUrl || "").trim();
    const initials = getInitials(name);

    if (src) {
        return (
            <img
                src={src}
                alt={name ? `${name} profile` : "Profile"}
                className={`${sizeClasses[size]} rounded-full object-cover ${ringClassName}`}
            />
        );
    }

    return (
        <div
            className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-slate-900 font-bold text-white ${ringClassName}`}
            aria-label={name ? `${name} profile` : "Profile"}
        >
            {initials}
        </div>
    );
}
