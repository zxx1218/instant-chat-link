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
  const [isTyping, setIsTyping] = useState(false);
  const [userId] = useState(() => generateUserId());
  const [roomName, setRoomName] = useState("临时聊天室");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    // Create realtime channel for this room
    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channelRef.current = channel;

    // Handle new messages
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
      
      // Send read receipt if message is from someone else
      if (payload.senderId !== userId) {
        channel.send({
          type: "broadcast",
          event: "read",
          payload: { messageIds: [payload.id], readerId: userId },
        });
      }
    });

    // Handle read receipts
    channel.on("broadcast", { event: "read" }, ({ payload }) => {
      if (payload.readerId !== userId) {
        setMessages((prev) =>
          prev.map((msg) =>
            payload.messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
          )
        );
      }
    });

    // Handle typing indicator
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

    // Handle presence for online count
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      setOnlineCount(Object.keys(state).length);
    });

    // Handle room name changes
    channel.on("broadcast", { event: "roomName" }, ({ payload }) => {
      setRoomName(payload.name);
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ online_at: new Date().toISOString() });
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

      // Add message locally immediately
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

      // Add message locally immediately
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
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 gap-4">
      <ChatHeader 
        roomId={roomId} 
        onlineCount={onlineCount} 
        roomName={roomName}
        onRoomNameChange={handleRoomNameChange}
      />
      
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 px-1">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
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
