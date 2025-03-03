import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Spin } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import { Message } from '@/types/Chat';

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
  isFullPage = false,
}) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to fetch messages when chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId || !recipientId) return;
      
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/messages/${chatId}`);
        // const data = await response.json();
        // setMessages(data.messages);
        
        // Mock data for testing
        setMessages([
          {
            id: '1',
            senderId: recipientId,
            senderName: recipientName,
            content: 'Hello, how are you?',
            timestamp: new Date(Date.now() - 3600000),
            isRead: true,
            isDeleted: false,
            isReported: false,
          },
          {
            id: '2',
            senderId: session?.user?.id || 'current-user',
            senderName: session?.user?.email || 'You',
            content: 'I\'m doing great, thanks!',
            timestamp: new Date(Date.now() - 1800000),
            isRead: true,
            isDeleted: false,
            isReported: false,
          },
        ]);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId, recipientId, recipientName, session?.user?.id, session?.user?.email]);

  const scrollToBottom = () => {
    // Use scrollIntoView with block: 'nearest' to prevent page jumping
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: session?.user?.id || 'current-user',
      senderName: session?.user?.email || 'You',
      content: newMessage,
      timestamp: new Date(),
      isRead: false,
      isDeleted: false,
      isReported: false,
    };

    try {
      // TODO: Replace with actual API call
      // await fetch('/api/messages/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     chatId,
      //     recipientId,
      //     content: newMessage,
      //   }),
      // });

      setMessages([...messages, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const containerClasses = isFullPage
    ? 'h-[calc(100vh-200px)] w-full'
    : 'h-full w-full shadow-lg rounded-lg';

  return (
    <div className={`flex flex-col bg-white ${containerClasses}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ maxHeight: 'calc(100% - 80px)', paddingTop: '1rem' }}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spin />
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === (session?.user?.id || 'current-user')
                ? 'justify-end'
                : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] break-words rounded-lg p-3 ${message.senderId === (session?.user?.id || 'current-user')
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'}`}
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