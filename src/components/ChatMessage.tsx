import { cn } from "@/lib/utils";
import { FileIcon, Download, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  content: string;
  isSelf: boolean;
  timestamp: Date;
  isRead?: boolean;
  file?: {
    name: string;
    type: string;
    data: string;
    isImage: boolean;
  };
}

export function ChatMessage({ content, isSelf, timestamp, isRead, file }: ChatMessageProps) {
  const handleDownload = () => {
    if (!file) return;
    
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        {file ? (
          file.isImage ? (
            <div className="space-y-2">
              <img
                src={file.data}
                alt={file.name}
                className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(file.data, "_blank")}
              />
              <p className="text-xs opacity-70 truncate">{file.name}</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="w-10 h-10 rounded-lg bg-background/20 flex items-center justify-center shrink-0">
                <FileIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs opacity-70">{file.type || "未知类型"}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDownload}
                className="shrink-0 hover:bg-background/20"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          )
        ) : (
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {content}
          </p>
        )}
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isSelf ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-[10px] opacity-60">
            {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {isSelf && (
            isRead ? (
              <CheckCheck className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Check className="w-3.5 h-3.5 opacity-60" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
