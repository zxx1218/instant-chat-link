import { useNavigate } from "react-router-dom";
import { MessageCircle, Link2, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateRoomId } from "@/lib/generateRoomId";

export function WelcomeScreen() {
  const navigate = useNavigate();

  const createRoom = () => {
    const roomId = generateRoomId();
    navigate(`/chat/${roomId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="relative">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center shadow-glow">
            <MessageCircle className="w-10 h-10 text-primary" />
          </div>
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-2xl bg-primary/30 blur-xl -z-10" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">
            临时聊天
          </h1>
          <p className="text-muted-foreground">
            无需注册，即开即聊，关闭即消
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">实时通讯</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-secondary flex items-center justify-center">
              <Link2 className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">链接分享</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-secondary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">阅后即焚</p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={createRoom}
          variant="glow"
          size="lg"
          className="w-full text-base"
        >
          创建聊天室
        </Button>

        {/* Footer note */}
        <p className="text-xs text-muted-foreground">
          消息不会被保存，关闭页面后聊天记录将自动清除
        </p>
      </div>
    </div>
  );
}
