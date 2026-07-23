import { Copy, Check, Users, Pencil, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ChatThemePicker } from "./ChatThemePicker";
import { ConnectionDiagnostics, type ConnStatus } from "./ConnectionDiagnostics";

interface ChatHeaderProps {
  roomId: string;
  onlineCount: number;
  peerOnline: boolean;
  connectionStatus: ConnStatus;
  rawStatus: string;
  connectedSince: number | null;
  presenceEvents: { at: number; text: string }[];
  timeoutMs: number;
  roomName: string;
  onRoomNameChange: (name: string) => void;
  themeId: string;
  onThemeChange: (id: string) => void;
}

export function ChatHeader({
  roomId,
  onlineCount,
  peerOnline,
  connectionStatus,
  rawStatus,
  connectedSince,
  presenceEvents,
  timeoutMs,
  roomName,
  onRoomNameChange,
  themeId,
  onThemeChange,
}: ChatHeaderProps) {
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
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success("链接已复制！发送给对方即可开始聊天");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("复制失败，请手动复制链接");
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

        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <span
            className="absolute -bottom-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center ring-2 ring-background"
            aria-label={`在线人数 ${onlineCount}`}
          >
            {onlineCount}
          </span>
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
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground truncate">
            {connectionStatus === "connected" ? (
              <span className="flex items-center gap-1 shrink-0">
                <span
                  className={cn(
                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0",
                    peerOnline ? "bg-green-500 animate-pulse" : "bg-muted-foreground/50"
                  )}
                />
                <span className="text-foreground/80">
                  {peerOnline ? "对方在线" : "等待对方加入"}
                </span>
              </span>
            ) : connectionStatus === "connecting" ? (
              <span className="flex items-center gap-1 shrink-0 text-amber-500">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                正在连接...
              </span>
            ) : (
              <span className="flex items-center gap-1 shrink-0 text-destructive">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-destructive shrink-0" />
                连接已断开
              </span>
            )}
            <span className="opacity-40 shrink-0">·</span>
            <span className="shrink-0 opacity-80">{onlineCount} 在线</span>
            <span className="opacity-40 shrink-0 hidden sm:inline">·</span>
            <span className="truncate opacity-70 hidden sm:inline">#{roomId}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <ConnectionDiagnostics
          status={connectionStatus}
          rawStatus={rawStatus}
          connectedSince={connectedSince}
          onlineCount={onlineCount}
          peerOnline={peerOnline}
          events={presenceEvents}
          timeoutMs={timeoutMs}
        />
        <ChatThemePicker themeId={themeId} onChange={onThemeChange} />
        <Button
          variant="outline"
          size="sm"
          onClick={copyLink}
          className="gap-1.5 sm:gap-2 h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm ml-1"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">已复制</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">复制链接</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
