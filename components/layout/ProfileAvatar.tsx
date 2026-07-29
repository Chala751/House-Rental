type ProfileAvatarProps = {
    name?: string;
    imageUrl?: string | null;
    size?: "sm" | "md" | "lg";
    ringClassName?: string;
};

const sizeClasses = {
    sm: "h-9 w-9 text-[0.7rem]",
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
    ringClassName = "ring-1 ring-line",
}: ProfileAvatarProps) {
    const src = String(imageUrl || "").trim();
    const initials = getInitials(name);

    if (src) {
        return (
            <img
                src={src}
                alt={name ? `${name} profile` : "Profile"}
                className={`${sizeClasses[size]} shrink-0 rounded-full bg-sunken object-cover ${ringClassName}`}
            />
        );
    }

    return (
        <div
            className={`${sizeClasses[size]} flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold tracking-wide text-accent ${ringClassName}`}
            aria-label={name ? `${name} profile` : "Profile"}
        >
            {initials}
        </div>
    );
}
