import React, { useState, useEffect } from 'react';
import { List, Avatar, Badge, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ChatPreview } from '@/types/Chat';

interface ChatListProps {
  onSelectChat: (chatId: string, recipientId: string, recipientName: string, recipientAvatar?: string) => void;
  selectedChatId?: string;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId }) => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Effect to fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/chats');
        // const data: GetChatsResponse = await response.json();
        // setChats(data.chats);
        // setHasMore(data.hasMore);
        // setNextCursor(data.nextCursor);

        // Mock data for testing
        const mockData: ChatPreview[] = [
          {
            id: '1',
            recipientId: 'user1',
            recipientName: 'John Doe',
            recipientRole: 'student',
            lastMessage: 'Hello, how are you?',
            timestamp: new Date(Date.now() - 3600000),
            unreadCount: 2,
            status: 'active',
          },
          {
            id: '2',
            recipientId: 'user2',
            recipientName: 'Jane Smith',
            recipientRole: 'tutor',
            lastMessage: 'When is our next session?',
            timestamp: new Date(Date.now() - 7200000),
            unreadCount: 0,
            status: 'active',
          },
        ];
        setChats(mockData);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const filteredChats = chats.filter(chat =>
    chat.recipientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white border-r">
      <div className="p-4 border-b">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Search conversations..."
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-lg"
        />
      </div>

      <List
        className="flex-1 overflow-y-auto"
        loading={loading}
        dataSource={filteredChats}
        renderItem={(chat) => (
          <List.Item
            className={`cursor-pointer hover:bg-gray-50 ${
              selectedChatId === chat.id ? 'bg-gray-100' : ''
            }`}
            onClick={() => onSelectChat(chat.id, chat.recipientId, chat.recipientName, chat.recipientAvatar)}
          >
            <List.Item.Meta
              avatar={
                <Badge count={chat.unreadCount} size="small">
                  <Avatar src={chat.recipientAvatar}>
                    {chat.recipientName[0]}
                  </Avatar>
                </Badge>
              }
              title={
                <div className="flex items-center">
                  <span>{chat.recipientName}</span>
                  {chat.status !== 'active' && (
                    <Badge
                      status={chat.status === 'suspended' ? 'error' : 'default'}
                      text={chat.status.toUpperCase()}
                      className="ml-2"
                    />
                  )}
                </div>
              }
              description={
                <div className="flex justify-between items-center pr-4">
                  <span className="text-sm truncate max-w-[70%]">{chat.lastMessage}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(chat.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default ChatList; 