import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { generateUserId } from "@/lib/generateRoomId";

interface FileData {
  name: string;
  type: string;
  data: string;
  isImage: boolean;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  file?: FileData;
  isRead?: boolean;
}

interface ChatRoomProps {
  roomId: string;
}

export function ChatRoom({ roomId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineCount, setOnlineCount] = useState(1);
  const [peerOnline, setPeerOnline] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");
  const [isTyping, setIsTyping] = useState(false);
  const [userId] = useState(() => generateUserId());
  const [roomName, setRoomName] = useState("临时聊天室");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channelRef.current = channel;

    channel.on("broadcast", { event: "message" }, ({ payload }) => {
      const newMessage: Message = {
        id: payload.id,
        content: payload.content,
        senderId: payload.senderId,
        timestamp: new Date(payload.timestamp),
        file: payload.file,
        isRead: false,
      };
      setMessages((prev) => [...prev, newMessage]);

      if (payload.senderId !== userId) {
        channel.send({
          type: "broadcast",
          event: "read",
          payload: { messageIds: [payload.id], readerId: userId },
        });
      }
    });

    channel.on("broadcast", { event: "read" }, ({ payload }) => {
      if (payload.readerId !== userId) {
        setMessages((prev) =>
          prev.map((msg) =>
            payload.messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
          )
        );
      }
    });

    channel.on("broadcast", { event: "typing" }, ({ payload }) => {
      if (payload.senderId !== userId) {
        setIsTyping(true);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const keys = Object.keys(state);
      setOnlineCount(keys.length);
      setPeerOnline(keys.some((k) => k !== userId));
    });

    channel.on("broadcast", { event: "roomName" }, ({ payload }) => {
      setRoomName(payload.name);
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setConnectionStatus("connected");
        await channel.track({ online_at: new Date().toISOString() });
      } else if (status === "CHANNEL_ERROR") {
        setConnectionStatus("error");
      } else if (status === "TIMED_OUT" || status === "CLOSED") {
        setConnectionStatus("disconnected");
      }
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      channel.unsubscribe();
    };
  }, [roomId, userId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!channelRef.current) return;

      const message = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2)}`,
        content,
        senderId: userId,
        timestamp: new Date().toISOString(),
      };

      channelRef.current.send({
        type: "broadcast",
        event: "message",
        payload: message,
      });

      setMessages((prev) => [
        ...prev,
        { ...message, timestamp: new Date(message.timestamp) },
      ]);
    },
    [userId]
  );

  const sendFile = useCallback(
    (file: FileData) => {
      if (!channelRef.current) return;

      const message = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2)}`,
        content: "",
        senderId: userId,
        timestamp: new Date().toISOString(),
        file,
      };

      channelRef.current.send({
        type: "broadcast",
        event: "message",
        payload: message,
      });

      setMessages((prev) => [
        ...prev,
        { ...message, timestamp: new Date(message.timestamp) },
      ]);
    },
    [userId]
  );

  const handleTyping = useCallback(() => {
    if (!channelRef.current) return;

    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { senderId: userId },
    });
  }, [userId]);

  const handleRoomNameChange = useCallback((name: string) => {
    if (!channelRef.current) return;

    setRoomName(name);
    channelRef.current.send({
      type: "broadcast",
      event: "roomName",
      payload: { name },
    });
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] max-w-3xl mx-auto p-2 sm:p-4 gap-2 sm:gap-4">
      <ChatHeader
        roomId={roomId}
        onlineCount={onlineCount}
        peerOnline={peerOnline}
        connectionStatus={connectionStatus}
        roomName={roomName}
        onRoomNameChange={handleRoomNameChange}
      />

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 sm:space-y-3 px-1 sm:px-2">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground px-4">
              <p className="text-sm">等待消息...</p>
              <p className="text-xs mt-1">复制链接分享给对方开始聊天</p>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            content={message.content}
            isSelf={message.senderId === userId}
            timestamp={message.timestamp}
            file={message.file}
            isRead={message.isRead}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={sendMessage} onSendFile={sendFile} onTyping={handleTyping} />
    </div>
  );
}
