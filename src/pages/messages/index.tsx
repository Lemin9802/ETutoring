import React, { useState } from 'react';
import ChatList from '@/components/Chat/ChatList';
import ChatBox from '@/components/Chat/ChatBox';
import { Card, Avatar, Badge, Tag } from 'antd';

const MessagesPage = () => {
  const [selectedChat, setSelectedChat] = useState<{
    chatId: string;
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
  } | null>(null);

  const handleSelectChat = (
    chatId: string,
    recipientId: string,
    recipientName: string,
    recipientAvatar?: string
  ) => {
    setSelectedChat({ chatId, recipientId, recipientName, recipientAvatar });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="h-[calc(100vh-120px)] shadow-lg">
        <div className="flex h-full">
          {/* Chat List - Takes up 1/3 of the space */}
          <div className="w-1/3 h-full border-r">
            <ChatList
              onSelectChat={handleSelectChat}
              selectedChatId={selectedChat?.chatId}
            />
          </div>

          {/* Chat Box or Welcome Message - Takes up 2/3 of the space */}
          <div className="w-2/3 h-full flex flex-col">
            {selectedChat ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Badge status="success" offset={[-6, 32]}>
                      <Avatar src={selectedChat.recipientAvatar} size={40}>
                        {selectedChat.recipientName[0]}
                      </Avatar>
                    </Badge>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{selectedChat.recipientName}</h3>
                        <Tag color="green">Student</Tag>
                      </div>
                      <span className="text-xs text-gray-500">
                        <span className="text-green-500">Online</span>
                      </span>
                    </div>
                  </div>
                </div>
                {/* Chat Box */}
                <div className="flex-1">
                  <ChatBox
                    chatId={selectedChat.chatId}
                    recipientId={selectedChat.recipientId}
                    recipientName={selectedChat.recipientName}
                    recipientAvatar={selectedChat.recipientAvatar}
                    isFullPage
                  />
                </div>
              </>
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