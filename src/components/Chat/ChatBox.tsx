import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Avatar, Spin, Badge, Tag } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import axios from "axios";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/types/Chat";

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
  const [connection, setConnection] = useState<HubConnection | null>(null);

  useEffect(() => {
    const connectToSignalR = async () => {
      if (!session?.user?.id) return;

      const newConnection = new HubConnectionBuilder()
        .withUrl(`http://localhost:5142/messageHub?userId=${session.user.id}`) // Truyền userId vào query
        .withAutomaticReconnect()
        .build();

      try {
        await newConnection.start();
        console.log("SignalR connection established");
        setConnection(newConnection);

        newConnection.on(
          "ReceiveMessage",
          (receiverId: string, senderId: string, message: string) => {
            console.log("📡 SignalR Received Message:", {
              senderId,
              receiverId,
              message,
            });

            if (senderId === session.user.id) {
              console.log("Ignoring message because it's sent by current user");
              return;
            }

            if (
              receiverId === session.user.id ||
              senderId === session.user.id
            ) {
              setMessages((prevMessages) => [
                ...prevMessages,
                {
                  id: uuidv4(),
                  sender_id: senderId,
                  receiver_id: receiverId,
                  content: message,
                  timestamp: new Date(),
                },
              ]);
            }
          }
        );
      } catch (err) {
        console.error("SignalR connection failed", err);
      }
    };

    connectToSignalR();

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [session?.user?.id, connection]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId || !session?.user?.id) return;

      setLoading(true);
      try {
        const { data } = await axios.post("/api/messages/get-message", {
          user_id: session.user.id,
          participant_id: recipientId,
        });

        setMessages(data?.messages || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [recipientId, session?.user?.id, chatId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session?.user?.id) return;

    const tempMessage: Message = {
      id: uuidv4(),
      sender_id: session.user.id,
      receiver_id: recipientId,
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setNewMessage("");

    try {
      await axios.post("/api/messages/send-message", {
        sender_id: session.user.id,
        receiver_id: recipientId,
        content: newMessage,
      });

      if (connection && connection.state === "Connected") {
        await connection.invoke(
          "SendMessage",
          recipientId,
          session.user.id,
          newMessage
        );
      } else {
        console.warn("SignalR connection is not established");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg !== tempMessage)
      );
    }
  };

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

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
        style={{ maxHeight: "calc(100% - 80px)", paddingTop: "1rem" }}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spin />
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === session?.user?.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] break-words rounded-lg p-3 ${
                  message.sender_id === session?.user?.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onPressEnter={handleSendMessage}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
