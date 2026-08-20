import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { generateUserId } from "@/lib/generateRoomId";
import { DEFAULT_THEME_ID, getTheme } from "@/lib/chatThemes";
import { toast } from "sonner";

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

interface PresenceEvent {
  at: number;
  text: string;
}

interface ChatRoomProps {
  roomId: string;
}

const PRESENCE_TIMEOUT_MS = 30_000;

export function ChatRoom({ roomId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineCount, setOnlineCount] = useState(1);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [peerOnline, setPeerOnline] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("connecting");
  const [rawStatus, setRawStatus] = useState<string>("INIT");
  const [connectedSince, setConnectedSince] = useState<number | null>(null);
  const [presenceEvents, setPresenceEvents] = useState<PresenceEvent[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [unreadBySender, setUnreadBySender] = useState<Record<string, number>>({});
  const [filterUserId, setFilterUserId] = useState<string | null>(null);
  const [userId] = useState(() => generateUserId());
  const [roomName, setRoomName] = useState("临时聊天室");

  const [themeId, setThemeId] = useState<string>(() => {
    try {
      return (
        localStorage.getItem(`chat-theme:${roomId}`) ??
        localStorage.getItem("chat-theme") ??
        DEFAULT_THEME_ID
      );
    } catch {
      return DEFAULT_THEME_ID;
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const typingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const prevPeersRef = useRef<Set<string>>(new Set());


  const theme = useMemo(() => getTheme(themeId), [themeId]);

  const logEvent = useCallback((text: string) => {
    setPresenceEvents((prev) => {
      const next = [...prev, { at: Date.now(), text }];
      return next.slice(-30);
    });
  }, []);

  const changeTheme = useCallback(
    (id: string) => {
      setThemeId(id);
      try {
        localStorage.setItem(`chat-theme:${roomId}`, id);
        localStorage.setItem("chat-theme", id);
      } catch {
        /* ignore */
      }
    },
    [roomId]
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleListScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    atBottomRef.current = atBottom;
    if (atBottom) setUnreadBySender({});
  }, []);

  useEffect(() => {
    if (atBottomRef.current) scrollToBottom();
  }, [messages, typingUsers, scrollToBottom]);


  useEffect(() => {
    let isActive = true;
    setConnectionStatus("connecting");
    setRawStatus("SUBSCRIBING");
    logEvent("正在建立连接...");

    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: { key: userId },
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
        setTypingUsers((prev) => prev.filter((u) => u !== payload.senderId));
        if (!atBottomRef.current) {
          setUnreadBySender((prev) => ({
            ...prev,
            [payload.senderId]: (prev[payload.senderId] ?? 0) + 1,
          }));
        }
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
      const sender: string = payload.senderId;
      if (sender !== userId) {
        setTypingUsers((prev) => (prev.includes(sender) ? prev : [...prev, sender]));
        if (typingTimersRef.current[sender]) clearTimeout(typingTimersRef.current[sender]);
        typingTimersRef.current[sender] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== sender));
          delete typingTimersRef.current[sender];
        }, 2500);
      }
    });


    channel.on("broadcast", { event: "roomName" }, ({ payload }) => {
      setRoomName(payload.name);
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const keys = Object.keys(state);
      setOnlineCount(keys.length);
      setOnlineUserIds(keys);
      setPeerOnline(keys.some((k) => k !== userId));
      prevPeersRef.current = new Set(keys);
    });

    channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
      if (key === userId) return;
      if (!prevPeersRef.current.has(key)) {
        logEvent(`用户加入 (${key.slice(0, 6)})`);
        toast.success("对方已加入聊天", { duration: 2000 });
      }
      prevPeersRef.current.add(key);
      void newPresences;
    });

    channel.on("presence", { event: "leave" }, ({ key }) => {
      if (key === userId) return;
      if (prevPeersRef.current.has(key)) {
        logEvent(`用户离开 (${key.slice(0, 6)})`);
        toast("对方已离开", { duration: 2000 });
      }
      prevPeersRef.current.delete(key);
    });

    channel.subscribe(async (status) => {
      if (!isActive) return;
      setRawStatus(status);
      if (status === "SUBSCRIBED") {
        setConnectionStatus("connected");
        setConnectedSince(Date.now());
        logEvent("已连接");
        await channel.track({ online_at: new Date().toISOString() });
      } else if (status === "CHANNEL_ERROR") {
        setConnectionStatus("error");
        setConnectedSince(null);
        logEvent("连接错误");
      } else if (status === "TIMED_OUT") {
        setConnectionStatus("disconnected");
        setConnectedSince(null);
        logEvent("连接超时");
      }
      // Ignore CLOSED (normal teardown / StrictMode)
    });

    return () => {
      isActive = false;
      Object.values(typingTimersRef.current).forEach(clearTimeout);
      typingTimersRef.current = {};

      supabase.removeChannel(channel);
      if (channelRef.current === channel) channelRef.current = null;
    };
  }, [roomId, userId, logEvent]);

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

  const themeStyle = useMemo(
    () =>
      ({
        background: theme.background,
        "--chat-bubble-self": theme.bubbleSelf,
        "--chat-bubble-other": theme.bubbleOther,
        "--chat-bubble-self-foreground": theme.bubbleSelfFg,
        "--chat-bubble-other-foreground": theme.bubbleOtherFg,
      }) as React.CSSProperties,
    [theme]
  );

  return (
    <div
      className="h-[100dvh] w-full transition-[background] duration-500"
      style={themeStyle}
    >
      <div className="flex flex-col h-[100dvh] max-w-3xl mx-auto p-2 sm:p-4 gap-2 sm:gap-4">
        <ChatHeader
          roomId={roomId}
          onlineCount={onlineCount}
          onlineUserIds={onlineUserIds}
          selfUserId={userId}
          peerOnline={peerOnline}
          connectionStatus={connectionStatus}
          rawStatus={rawStatus}
          connectedSince={connectedSince}
          presenceEvents={presenceEvents}
          timeoutMs={PRESENCE_TIMEOUT_MS}
          roomName={roomName}
          onRoomNameChange={handleRoomNameChange}
          themeId={themeId}
          onThemeChange={changeTheme}
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
          {messages.map((message, idx) => {
            const prev = messages[idx - 1];
            const showSender = !prev || prev.senderId !== message.senderId;
            return (
              <ChatMessage
                key={message.id}
                content={message.content}
                isSelf={message.senderId === userId}
                senderId={message.senderId}
                showSender={showSender}
                timestamp={message.timestamp}
                file={message.file}
                isRead={message.isRead}
              />
            );
          })}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput
          onSendMessage={sendMessage}
          onSendFile={sendFile}
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
}
