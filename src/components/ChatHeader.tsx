import { Copy, Check, Users, Pencil, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ChatThemePicker } from "./ChatThemePicker";
import { ConnectionDiagnostics, type ConnStatus } from "./ConnectionDiagnostics";
import { UserAvatarBadge } from "./UserAvatarBadge";

interface ChatHeaderProps {
  roomId: string;
  onlineCount: number;
  onlineUserIds: string[];
  selfUserId: string;
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
  unreadBySender?: Record<string, number>;
  typingUserIds?: string[];
  filterUserId?: string | null;
  onFilterUser?: (userId: string) => void;
}


export function ChatHeader({
  roomId,
  onlineCount,
  onlineUserIds,
  selfUserId,
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
  unreadBySender = {},
  typingUserIds = [],
  filterUserId = null,
  onFilterUser,
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

        {rosterIds.length > 0 ? (
          <div className="flex -space-x-2 shrink-0" aria-label={`在线用户 ${onlineCount}`}>
            {rosterIds.slice(0, 4).map((uid) => {
              const self = uid === selfUserId;
              const online = onlineUserIds.includes(uid);
              const avatar = getUserAvatar(uid);
              const unread = unreadBySender[uid] ?? 0;
              const typing = typingUserIds.includes(uid);
              const active = filterUserId === uid;
              return (
                <Tooltip key={uid}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onFilterUser?.(uid)}
                      className={cn(
                        "relative rounded-full transition-transform hover:z-10 hover:scale-110 focus:outline-none",
                        active && "z-10 ring-2 ring-primary rounded-full"
                      )}
                      aria-label={`筛选 ${getUserLabel(uid, self)} 的消息`}
                    >
                      <UserAvatarBadge userId={uid} size="sm" showRing online={online} />
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center ring-2 ring-background">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span>{avatar.emoji}</span>
                      <span>{self ? "我" : getUserLabel(uid, false)}</span>
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      {online ? "在线" : "离线"}
                      {typing && " · 正在输入…"}
                      {unread > 0 && ` · ${unread} 条未读`}
                    </div>
                    <div className="text-[10px] opacity-60">#{uid.slice(0, 8)}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">
                      {active ? "点击显示全部消息" : "点击只看 TA 的消息"}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            {rosterIds.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold flex items-center justify-center ring-2 ring-background shrink-0">
                +{rosterIds.length - 4}
              </div>
            )}
          </div>
        ) : (

          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
        )}

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
