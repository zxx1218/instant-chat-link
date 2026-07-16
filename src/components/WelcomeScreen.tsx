import { useNavigate } from "react-router-dom";
import { MessageCircle, Link2, Shield, Zap, ArrowRight, Hash } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateRoomId } from "@/lib/generateRoomId";
import { toast } from "sonner";

export function WelcomeScreen() {
  const navigate = useNavigate();
  const [customRoomId, setCustomRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  const createRoom = () => {
    const trimmed = customRoomId.trim();
    if (trimmed) {
      // 验证房间号合法性：字母、数字、下划线、连字符，2-32 位
      if (!/^[a-zA-Z0-9_-]{2,32}$/.test(trimmed)) {
        toast.error("房间号只能包含字母、数字、下划线或短横线（2-32 位）");
        return;
      }
      navigate(`/chat/${trimmed}`);
    } else {
      navigate(`/chat/${generateRoomId()}`);
    }
  };

  const joinRoom = () => {
    const trimmed = joinRoomId.trim();
    if (!trimmed) {
      toast.error("请输入要加入的房间号");
      return;
    }
    navigate(`/chat/${trimmed}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:p-6">
      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="max-w-md w-full text-center space-y-6 sm:space-y-8">
        {/* Logo */}
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center shadow-glow backdrop-blur-sm">
            <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
          <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-primary/30 blur-2xl -z-10" />
        </div>

        {/* Title */}
        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            临时聊天
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            无需注册，即开即聊，关闭即消
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { icon: Zap, label: "实时通讯" },
            { icon: Link2, label: "链接分享" },
            { icon: Shield, label: "阅后即焚" },
          ].map((f) => (
            <div key={f.label} className="space-y-2 p-2 sm:p-3 rounded-xl glass hover:bg-secondary/50 transition-colors">
              <div className="w-9 h-9 sm:w-10 sm:h-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                <f.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">{f.label}</p>
            </div>
          ))}
        </div>

        {/* 创建房间 */}
        <div className="glass rounded-2xl p-4 sm:p-5 space-y-3 text-left">
          <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-primary" />
            创建聊天室
          </label>
          <Input
            value={customRoomId}
            onChange={(e) => setCustomRoomId(e.target.value)}
            placeholder="自定义房间号（可选，留空自动生成）"
            className="bg-background/50 border-border/50 h-10 sm:h-11 text-sm"
            maxLength={32}
            onKeyDown={(e) => e.key === "Enter" && createRoom()}
          />
          <Button
            onClick={createRoom}
            variant="glow"
            size="lg"
            className="w-full text-sm sm:text-base h-11 sm:h-12"
          >
            创建聊天室
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* 加入房间 */}
        <div className="glass rounded-2xl p-4 sm:p-5 space-y-3 text-left">
          <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5 text-primary" />
            加入已有聊天室
          </label>
          <div className="flex gap-2">
            <Input
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              placeholder="输入房间号"
              className="bg-background/50 border-border/50 h-10 sm:h-11 text-sm flex-1"
              maxLength={32}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            />
            <Button
              onClick={joinRoom}
              variant="outline"
              size="lg"
              className="h-10 sm:h-11 px-4 shrink-0"
            >
              加入
            </Button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-[11px] sm:text-xs text-muted-foreground px-2">
          消息不会被保存，关闭页面后聊天记录将自动清除
        </p>
      </div>
    </div>
  );
}
