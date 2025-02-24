import React, { useState } from 'react';
import { Button, Badge, Drawer } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import ChatList from './ChatList';
import ChatBox from './ChatBox';

interface GlobalChatButtonProps {
  unreadCount?: number;
}

const GlobalChatButton: React.FC<GlobalChatButtonProps> = ({ unreadCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleClose = () => {
    setIsOpen(false);
    setSelectedChat(null);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Badge count={unreadCount} offset={[-5, 5]}>
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<MessageOutlined />}
            onClick={() => setIsOpen(true)}
            className="shadow-lg"
          />
        </Badge>
      </div>

      <Drawer
        title={selectedChat ? selectedChat.recipientName : "Messages"}
        placement="right"
        width={400}
        onClose={handleClose}
        open={isOpen}
        className="chat-drawer"
      >
        {selectedChat ? (
          <ChatBox
            chatId={selectedChat.chatId}
            recipientId={selectedChat.recipientId}
            recipientName={selectedChat.recipientName}
            recipientAvatar={selectedChat.recipientAvatar}
            onClose={() => setSelectedChat(null)}
          />
        ) : (
          <ChatList
            onSelectChat={handleSelectChat}
            selectedChatId={undefined}
          />
        )}
      </Drawer>
    </>
  );
};

export default GlobalChatButton; 