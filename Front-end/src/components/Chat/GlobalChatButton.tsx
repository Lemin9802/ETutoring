import React, {useState} from "react";
import {Button, Badge, Popover} from "antd";
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
            chatroomId: string;
            chatId: string;
            recipientId: string;
            recipientName: string;
            recipientAvatar?: string;
            isMinimized?: boolean;
        }>
    >([]);

    const handleSelectChat = ({
                                  chatroomId,
                                  chatId,
                                  recipientId,
                                  recipientName,
                                  recipientAvatar,
                              }: {
        chatroomId: string;
        chatId: string;
        recipientId: string;
        recipientName: string;
        recipientAvatar?: string;
    }) => {
        if (!activeChats.find((chat) => chat.chatId === chatId)) {
            setActiveChats([
                ...activeChats,
                {
                    chatroomId,
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
                    ? {...chat, isMinimized: !chat.isMinimized}
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
                            icon={<MessageOutlined/>}
                            onClick={() => setIsListOpen(true)}
                            className="shadow-lg"
                        />
                    </Badge>
                </div>
            </Popover>

            <div
                className="fixed bottom-0 right-20 flex items-end space-x-4 z-50 max-h-[calc(100vh-100px)] overflow-y-auto">
                {activeChats.map((chat) => (
                    <div
                        key={chat.chatId}
                        className={`transition-all duration-300 ease-in-out ${
                            chat.isMinimized ? "h-[48px]" : "h-[450px]"
                        } w-[350px] max-h-[calc(100vh-120px)]`}
                        style={{width: "350px"}}
                    >
                        <div className="bg-white rounded-t-lg shadow-lg overflow-hidden h-full flex flex-col">
                            <div
                                className="flex items-center justify-between p-3 bg-white text-black cursor-pointer sticky top-0 z-10 border-b"
                                onClick={() => handleMinimize(chat.chatId)}
                            >
                                <span className="font-semibold">{chat.recipientName}</span>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        type="text"
                                        size="middle"
                                        icon={
                                            <MinusOutlined
                                                style={{fontSize: "16px", color: "black"}}
                                            />
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMinimize(chat.chatId);
                                        }}
                                        className="hover:bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center p-0"
                                    />
                                    <Button
                                        type="text"
                                        size="middle"
                                        icon={
                                            <CloseOutlined
                                                style={{fontSize: "16px", color: "black"}}
                                            />
                                        }
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClose(chat.chatId);
                                        }}
                                        className="hover:bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center p-0"
                                    />
                                </div>
                            </div>
                            {!chat.isMinimized && (
                                <div className="flex-1 overflow-hidden">
                                    <ChatBox
                                        chatroomId={chat.chatroomId}
                                        chatId={chat.chatId}
                                        recipientId={chat.recipientId}
                                        recipientName={chat.recipientName}
                                        recipientAvatar={chat.recipientAvatar}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default GlobalChatButton;
