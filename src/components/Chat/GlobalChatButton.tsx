import React, { useState } from "react";
import { Button, Badge, Popover } from "antd";
import {
  MessageOutlined,
  MinusOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import ChatList from "./ChatList";
import ChatBox from "./ChatBox";

interface GlobalChatButtonProps {
  unreadCount?: number;
}

const GlobalChatButton: React.FC<GlobalChatButtonProps> = ({
  unreadCount = 0,
}) => {
  const [isListOpen, setIsListOpen] = useState(false);
  const [activeChats, setActiveChats] = useState<
    Array<{
      chatId: string;
      recipientId: string;
      recipientName: string;
      recipientAvatar?: string;
      isMinimized?: boolean;
    }>
  >([]);

  const handleSelectChat = (
    chatId: string,
    recipientId: string,
    recipientName: string,
    recipientAvatar?: string
  ) => {
    if (!activeChats.find((chat) => chat.chatId === chatId)) {
      setActiveChats([
        ...activeChats,
        {
          chatId,
          recipientId,
          recipientName,
          recipientAvatar,
          isMinimized: false,
        },
      ]);
    }
    setIsListOpen(false);
  };

  const handleClose = (chatId: string) => {
    setActiveChats(activeChats.filter((chat) => chat.chatId !== chatId));
  };

  const handleMinimize = (chatId: string) => {
    setActiveChats(
      activeChats.map((chat) =>
        chat.chatId === chatId
          ? { ...chat, isMinimized: !chat.isMinimized }
          : chat
      )
    );
  };

  return (
    <>
      <Popover
        content={
          <div className="w-[300px]">
            <ChatList
              onSelectChat={handleSelectChat}
              selectedChatId={undefined}
            />
          </div>
        }
        trigger="click"
        open={isListOpen}
        onOpenChange={setIsListOpen}
        placement="topRight"
      >
        <div className="fixed bottom-6 right-6 z-50">
          <Badge count={unreadCount} offset={[-5, 5]}>
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<MessageOutlined />}
              onClick={() => setIsListOpen(true)}
              className="shadow-lg"
            />
          </Badge>
        </div>
      </Popover>

      <div className="fixed bottom-0 right-20 flex items-end space-x-4 z-50">
        {activeChats.map((chat) => (
          <div
            key={chat.chatId}
            className={`transition-all duration-300 ease-in-out ${
              chat.isMinimized ? "h-[48px]" : "h-[450px]"
            }`}
            style={{ width: "350px" }}
          >
            <div className="bg-white rounded-t-lg shadow-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-3 bg-primary text-white cursor-pointer"
                onClick={() => handleMinimize(chat.chatId)}
              >
                <span className="font-semibold">{chat.recipientName}</span>
                <div className="flex items-center space-x-2">
                  <Button
                    type="text"
                    size="middle"
                    icon={<MinusOutlined style={{ fontSize: "16px" }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMinimize(chat.chatId);
                    }}
                    className="text-black hover:bg-white/20 rounded-full h-8 w-8 flex items-center justify-center p-0 bg-white/10"
                  />
                  <Button
                    type="text"
                    size="middle"
                    icon={<CloseOutlined style={{ fontSize: "16px" }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose(chat.chatId);
                    }}
                    className="text-red hover:bg-white/20 rounded-full h-8 w-8 flex items-center justify-center p-0 bg-white/10"
                  />
                </div>
              </div>
              {!chat.isMinimized && (
                <ChatBox
                  chatId={chat.chatId}
                  recipientId={chat.recipientId}
                  recipientName={chat.recipientName}
                  recipientAvatar={chat.recipientAvatar}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default GlobalChatButton;
