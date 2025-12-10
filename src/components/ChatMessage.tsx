import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  isSelf: boolean;
  timestamp: Date;
}

export function ChatMessage({ content, isSelf, timestamp }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex message-enter",
        isSelf ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm",
          isSelf
            ? "bg-chat-self text-chat-self-foreground rounded-br-md"
            : "bg-chat-other text-chat-other-foreground rounded-bl-md"
        )}
      >
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {content}
        </p>
        <p
          className={cn(
            "text-[10px] mt-1 opacity-60",
            isSelf ? "text-right" : "text-left"
          )}
        >
          {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
