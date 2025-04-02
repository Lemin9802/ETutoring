import React, {useState, useEffect} from "react";
import {List, Avatar, Input, Empty} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import axios from "axios";
import {useSession} from "next-auth/react";
import {ConversationResponse} from "@/types/Chat";

interface ChatListProps {
    onSelectChat: (chat: {
        chatId: string;          // conversation_id
        chatroomId: string;      // chatroom_id
        recipientId: string;
        recipientName: string;
        recipientAvatar?: string;
    }) => void;
    selectedChatId?: string;
}

const ChatList: React.FC<ChatListProps> = ({onSelectChat, selectedChatId}) => {
    const {data: session} = useSession();
    const [chats, setChats] = useState<ConversationResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchChats = async () => {
            if (!session?.user?.id) return;
            setLoading(true);
            try {
                const {data} = await axios.post("/api/messages/get-all-message", {
                    user_id: session.user.id,
                });
                // Giả sử API trả về: { success: true, data: ConversationResponse[] }
                const conversations: ConversationResponse[] = Array.isArray(data)
                    ? data
                    : data.data || [];
                setChats(conversations);
            } catch (error) {
                console.error("Error fetching chats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [session?.user?.id]);

    return (
        <div className="h-full flex flex-col bg-white border-r">
            <div className="p-4 border-b">
                <Input
                    prefix={<SearchOutlined className="text-gray-400"/>}
                    placeholder="Search conversations..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-lg"
                />
            </div>

            {chats.length === 0 && !loading ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No conversations found"/>
            ) : (
                <List
                    className="flex-1 overflow-y-auto"
                    loading={loading}
                    dataSource={chats}
                    renderItem={(chat) => {
                        const fullName = chat.full_name?.trim() || "Unknown User";
                        const profilePicture = chat.profile_picture || "";
                        return (
                            <List.Item
                                className={`cursor-pointer hover:bg-gray-50 ${
                                    selectedChatId === chat.conversation_id ? "bg-gray-100" : ""
                                }`}
                                onClick={() =>
                                    onSelectChat({
                                        chatId: chat.conversation_id,      // giữ nguyên conversation_id trong chatId
                                        chatroomId: chat.chatroom_id,        // thêm chatroomId từ API
                                        recipientId: chat.participant_id.toString(),
                                        recipientName: fullName,
                                        recipientAvatar: profilePicture,
                                    })
                                }
                            >
                                <List.Item.Meta
                                    avatar={<Avatar src={profilePicture}>{fullName[0]}</Avatar>}
                                    title={<span>{fullName}</span>}
                                    description={<span>{chat.last_message || "No messages yet"}</span>}
                                />
                            </List.Item>
                        );
                    }}
                />
            )}
        </div>
    );
};

export default ChatList;
