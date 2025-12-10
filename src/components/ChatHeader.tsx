import { Copy, Check, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChatHeaderProps {
  roomId: string;
  onlineCount: number;
}

export function ChatHeader({ roomId, onlineCount }: ChatHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const link = `${window.location.origin}/chat/${roomId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("链接已复制！发送给对方即可开始聊天");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="glass rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">临时聊天室</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {onlineCount} 人在线
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={copyLink}
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            已复制
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            复制链接
          </>
        )}
      </Button>
    </header>
  );
}
