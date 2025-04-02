import React, { useRef, useEffect } from "react";
import { Spin } from "antd";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: Date;
  sender_full_name?: string;
  sender_email?: string;
  receiver_full_name?: string;
  receiver_email?: string;
}

export interface ConversationData {
  total_messages: number;
  messages: Message[];
}

interface ConversationDetailsProps {
  conversationData: ConversationData | null;
  loading: boolean;
  currentUserId: string;
}

const ConversationDetails: React.FC<ConversationDetailsProps> = ({
  conversationData,
  loading,
  currentUserId,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin />
      </div>
    );
  }

  if (!conversationData || conversationData.messages.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No messages yet.
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto" style={{ maxHeight: "60vh" }}>
      {conversationData.messages.map((msg) => {
        const isSender = msg.sender_id === currentUserId;
        // Nếu tin nhắn không do người dùng gửi, hiển thị full name nếu có, nếu không có thì email
        const senderName =
          msg.sender_full_name && msg.sender_full_name.trim().length > 0
            ? msg.sender_full_name
            : msg.sender_email || "";
        return (
          <div
            key={msg.id}
            className={`mb-3 flex ${isSender ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                isSender
                  ? "bg-blue-500 text-white rounded-tr-none"
                  : "bg-gray-200 text-gray-800 rounded-tl-none"
              }`}
            >
              <div className="text-sm font-semibold mb-1">
                {isSender ? "You" : senderName}
              </div>
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              <div className="text-xs text-right mt-1 opacity-75">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ConversationDetails;
