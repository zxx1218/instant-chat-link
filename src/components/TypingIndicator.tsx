import { UserAvatarBadge } from "./UserAvatarBadge";
import { getUserLabel } from "@/lib/userAvatar";

interface TypingIndicatorProps {
  userIds?: string[];
}

export function TypingIndicator({ userIds = [] }: TypingIndicatorProps) {
  const label =
    userIds.length === 0
      ? "对方正在输入…"
      : userIds.length === 1
        ? `${getUserLabel(userIds[0], false)} 正在输入…`
        : `${userIds.length} 位成员正在输入…`;

  return (
    <div className="flex justify-start message-enter gap-2 items-end">
      <div className="w-8 shrink-0 flex -space-x-2">
        {userIds.slice(0, 2).map((uid) => (
          <UserAvatarBadge key={uid} userId={uid} size="sm" showRing />
        ))}
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[10px] mb-0.5 px-1 text-muted-foreground">{label}</span>
        <div className="bg-chat-other px-4 py-3 rounded-2xl rounded-bl-md">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
            <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
            <span className="w-2 h-2 bg-muted-foreground rounded-full typing-dot" />
          </div>
        </div>
      </div>
    </div>
  );
}
