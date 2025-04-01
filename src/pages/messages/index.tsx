import React, { useState } from "react";
import ChatList from "@/components/Chat/ChatList";
import ChatBox from "@/components/Chat/ChatBox";
import { Card, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const MessagesPage = () => {
  const [selectedChat, setSelectedChat] = useState<{
    chatId: string;
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
  } | null>(null);

  const handleSelectChat = ({
    chatId,
    recipientId,
    recipientName,
    recipientAvatar,
  }: {
    chatId: string;
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
  }) => {
    setSelectedChat({ chatId, recipientId, recipientName, recipientAvatar });
    setShowSidebar(false);
  };

  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="h-[calc(100vh-120px)] shadow-lg">
        <div className="flex h-full flex-col md:flex-row">
          {/* Mobile sidebar toggle button */}
          <Button
            className="md:hidden absolute top-4 left-4 z-10"
            icon={<MenuOutlined />}
            onClick={() => setShowSidebar(!showSidebar)}
          />

          {/* Chat List - Takes up 1/3 of the space on desktop, collapsible on mobile */}
          <div
            className={`${
              showSidebar ? "block" : "hidden"
            } md:block w-full md:w-1/3 h-full border-r relative md:static`}
          >
            <ChatList
              onSelectChat={handleSelectChat}
              selectedChatId={selectedChat?.chatId}
            />
          </div>

          {/* Chat Box or Welcome Message - Takes up 2/3 of the space on desktop, full width when sidebar is hidden */}
          <div
            className={`w-full ${
              showSidebar ? "hidden" : "block"
            } md:block md:w-2/3 h-full flex flex-col`}
          >
            {selectedChat ? (
              <div className="flex-1">
                <ChatBox
                  chatId={selectedChat.chatId}
                  recipientId={selectedChat.recipientId}
                  recipientName={selectedChat.recipientName}
                  recipientAvatar={selectedChat.recipientAvatar}
                  isFullPage
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    Welcome to Messages
                  </h3>
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MessagesPage;
