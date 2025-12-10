import { useState, useRef, useEffect } from "react";
import { Send, Image, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendFile: (file: { name: string; type: string; data: string; isImage: boolean }) => void;
  onTyping: () => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ChatInput({ onSendMessage, onSendFile, onTyping, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping();
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("文件大小不能超过 5MB");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onSendFile({
          name: file.name,
          type: file.type,
          data: base64,
          isImage: isImage && file.type.startsWith("image/")
        });
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("文件读取失败");
    }

    // Reset input
    e.target.value = "";
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 glass rounded-2xl">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, true)}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileSelect(e, false)}
      />
      
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        onClick={() => imageInputRef.current?.click()}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <Image className="w-4 h-4" />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <Paperclip className="w-4 h-4" />
      </Button>
      
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="输入消息..."
        disabled={disabled}
        rows={1}
        className="flex-1 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground text-sm leading-relaxed scrollbar-thin min-h-[24px] max-h-[120px]"
      />
      <Button
        type="submit"
        variant="send"
        size="icon-sm"
        disabled={!message.trim() || disabled}
        className="shrink-0"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}
