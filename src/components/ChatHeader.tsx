import { Copy, Check, Users, Pencil, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChatHeaderProps {
  roomId: string;
  onlineCount: number;
  peerOnline: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  roomName: string;
  onRoomNameChange: (name: string) => void;
}

export function ChatHeader({ roomId, onlineCount, peerOnline, connectionStatus, roomName, onRoomNameChange }: ChatHeaderProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(roomName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(roomName);
  }, [roomName]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== roomName) {
      onRoomNameChange(trimmed);
      toast.success("房间名称已更新");
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(roomName);
      setIsEditing(false);
    }
  };

  const copyLink = async () => {
    const link = `${window.location.origin}/chat/${roomId}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success("链接已复制！发送给对方即可开始聊天");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("复制失败，请手动复制链接");
      console.error("复制失败:", err);
    }
  };

  return (
    <header className="glass rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate("/")}
          className="shrink-0 sm:hidden"
          aria-label="返回"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="h-7 w-full max-w-[180px] text-sm font-semibold"
              maxLength={20}
            />
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5 group">
              <h1 className="font-semibold text-foreground text-sm sm:text-base truncate">
                {roomName}
              </h1>
              <button
                onClick={() => setIsEditing(true)}
                className="sm:opacity-0 sm:group-hover:opacity-100 opacity-70 transition-opacity p-1 hover:bg-muted rounded shrink-0"
                aria-label="编辑房间名称"
              >
                <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
              </button>
            </div>
          )}
          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1 sm:gap-1.5 truncate">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
            <span className="truncate">
              {onlineCount} 在线 · <span className="opacity-70">#{roomId}</span>
            </span>
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={copyLink}
        className="gap-1.5 sm:gap-2 shrink-0 h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">已复制</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline sm:inline">复制链接</span>
          </>
        )}
      </Button>
    </header>
  );
}
