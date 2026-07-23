import { cn } from "@/lib/utils";
import { getUserAvatar } from "@/lib/userAvatar";

interface UserAvatarBadgeProps {
  userId: string;
  size?: "sm" | "md" | "lg";
  showRing?: boolean;
  online?: boolean;
  className?: string;
  title?: string;
}

const SIZE_CLASSES: Record<string, string> = {
  sm: "w-6 h-6 text-[13px]",
  md: "w-8 h-8 text-[16px]",
  lg: "w-10 h-10 text-[20px]",
};

export function UserAvatarBadge({
  userId,
  size = "md",
  showRing = false,
  online,
  className,
  title,
}: UserAvatarBadgeProps) {
  const a = getUserAvatar(userId);
  return (
    <div
      className={cn(
        "relative rounded-full flex items-center justify-center select-none shrink-0",
        SIZE_CLASSES[size],
        showRing && "ring-2 ring-background",
        className
      )}
      style={{ background: a.bg, color: a.fg }}
      title={title ?? `用户 ${userId.slice(0, 6)}`}
      aria-label={title ?? `用户 ${userId.slice(0, 6)}`}
    >
      <span className="leading-none">{a.emoji}</span>
      {typeof online === "boolean" && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-background",
            online ? "bg-green-500" : "bg-muted-foreground/60"
          )}
        />
      )}
    </div>
  );
}
