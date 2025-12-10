import { useParams, Navigate } from "react-router-dom";
import { ChatRoom } from "@/components/ChatRoom";

const Chat = () => {
  const { roomId } = useParams<{ roomId: string }>();

  if (!roomId) {
    return <Navigate to="/" replace />;
  }

  return <ChatRoom roomId={roomId} />;
};

export default Chat;
