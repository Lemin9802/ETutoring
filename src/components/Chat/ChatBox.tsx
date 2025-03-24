import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Avatar, Spin, Badge, Tag } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import axios from "axios";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: Date;
}

interface ChatBoxProps {
  chatId?: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  onClose?: () => void;
  isFullPage?: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  chatId,
  recipientId,
  recipientName,
  recipientAvatar,
  onClose,
  isFullPage = false,
}) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const connectionRef = useRef<HubConnection | null>(null);
  const isListenerRegistered = useRef(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    // Nếu connectionRef.current đã có, tức là listener đã được đăng ký
    if (connectionRef.current) return;
  
    const userId = session.user.id;
    const newConnection = new HubConnectionBuilder()
      .withUrl(`http://localhost:5142/messageHub?userId=${userId}`)
      .withAutomaticReconnect()
      .build();
  
    newConnection
      .start()
      .then(() => {
        console.log("SignalR connection established");
        connectionRef.current = newConnection;
        if (!isListenerRegistered.current) {
          newConnection.on("ReceiveMessage", (senderId: string, receiverId: string, message: string) => {
            console.log("[SignalR] ReceiveMessage:", { senderId, receiverId, message });
            // Nếu tin nhắn đến từ chính mình, FE đã dùng optimistic UI → bỏ qua
            if (senderId === userId) {
              console.log("Skipping event because I'm sender");
              return;
            }
            // Nếu mình là receiver, thêm tin nhắn vào state
            if (receiverId === userId) {
              const newMsg: Message = {
                id: uuidv4(),
                sender_id: senderId,
                receiver_id: receiverId,
                content: message,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, newMsg]);
            }
          });
          isListenerRegistered.current = true;
        }
      })
      .catch((err) => console.error("SignalR connection failed:", err));
  
    return () => {
      if (connectionRef.current) {
        // Hủy đăng ký listener để tránh trường hợp duplicate khi unmount
        connectionRef.current.off("ReceiveMessage");
        connectionRef.current.stop();
        connectionRef.current = null;
        isListenerRegistered.current = false;
      }
    };
  }, [session?.user?.id]);
  

  // Fetch tin nhắn ban đầu khi mở chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId || !session?.user?.id) return;
      setLoading(true);
      try {
        const { data } = await axios.post("/api/messages/get-message", {
          user_id: session.user.id,
          participant_id: recipientId,
        });
        setMessages(data?.data?.messages || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [recipientId, session?.user?.id, chatId]);

  // Hàm gửi tin nhắn
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session?.user?.id) return;

    const tempMessage: Message = {
      id: uuidv4(),
      sender_id: session.user.id,
      receiver_id: recipientId,
      content: newMessage,
      timestamp: new Date(),
    };

    // Optimistic UI: Sender tự thêm tin nhắn vào state
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      // Gửi tin nhắn lên API để lưu vào DB
      await axios.post("/api/messages/send-message", {
        sender_id: session.user.id,
        receiver_id: recipientId,
        content: tempMessage.content,
      });

      // Gọi SignalR để gửi tin cho Receiver (BE sẽ không gửi lại cho Sender)
      if (connectionRef.current && connectionRef.current.state === "Connected") {
        await connectionRef.current.invoke(
          "SendMessage",
          session.user.id,  // sender
          recipientId,      // receiver
          tempMessage.content
        );
      } else {
        console.warn("SignalR connection not established");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Rollback nếu có lỗi
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
    }
  };

  // Auto-scroll khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const containerClasses = isFullPage
    ? "h-[calc(100vh-200px)] w-full"
    : "h-full w-full shadow-lg rounded-lg";

  return (
    <div className={`flex flex-col bg-white ${containerClasses}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <Badge status="success" offset={[-6, 32]}>
            <Avatar src={recipientAvatar} size={40}>
              {recipientName ? recipientName[0] : "?"}
            </Avatar>
          </Badge>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">{recipientName}</h3>
              <Tag color="green">Student</Tag>
            </div>
            <span className="text-xs text-gray-500">
              <span className="text-green-500">Online</span>
            </span>
          </div>
        </div>
        {!isFullPage && onClose && (
          <Button
            type="text"
            onClick={onClose}
            className="hover:bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center"
          >
            ×
          </Button>
        )}
      </div>

      {/* Danh sách tin nhắn */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        style={{ maxHeight: "calc(100% - 80px)", paddingTop: "1rem" }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spin />
          </div>
        ) : (
          messages.map((message) => {
            const isSender = message.sender_id === session?.user?.id;
            return (
              <div key={message.id} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] break-words rounded-lg p-3 ${isSender ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"}`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-75">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input tin nhắn */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onPressEnter={handleSendMessage}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
