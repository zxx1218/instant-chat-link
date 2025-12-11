import { Copy, Check, Users, Pencil } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChatHeaderProps {
  roomId: string;
  onlineCount: number;
  roomName: string;
  onRoomNameChange: (name: string) => void;
}

export function ChatHeader({ roomId, onlineCount, roomName, onRoomNameChange }: ChatHeaderProps) {
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
      // 优先使用现代 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else { // 降级方案：使用传统的 execCommand
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
    
    try {
      // 优先使用现代 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        // 降级方案：使用传统的 execCommand
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
    <header className="glass rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="h-7 w-40 text-sm font-semibold"
              maxLength={20}
            />
          ) : (
            <div className="flex items-center gap-1.5 group">
              <h1 className="font-semibold text-foreground">{roomName}</h1>
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          )}
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
