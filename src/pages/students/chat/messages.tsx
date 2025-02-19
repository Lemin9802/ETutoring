import { Button, Input, Avatar, Layout, Space, Typography } from "antd";
import { MessageOutlined, CloseOutlined } from "@ant-design/icons";
import { useState, useRef, useEffect } from "react";

const { Sider, Content } = Layout;
const { Title } = Typography;

const Messages: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState([
    { id: 1, sender: "John", content: "Hey, how are you?", isSender: true },
    { id: 2, sender: "Jane", content: "I'm good, thanks! How about you?", isSender: false },
    { id: 3, sender: "John", content: "Good as well, what’s up?", isSender: true },
    { id: 4, sender: "Jane", content: "Just checking in!", isSender: false },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false); // Open chat state
  const chatEndRef = useRef<HTMLDivElement | null>(null); // Reference to scroll to bottom

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMessageObj = {
        id: messages.length + 1,
        sender: "John", // Assuming "John" is the current user
        content: newMessage,
        isSender: true,
      };
      setMessages([...messages, newMessageObj]);
      setNewMessage(""); // Clear input after sending
    }
  };

  const handleCloseChat = () => {
    setIsChatOpen(false); // Close the current chat
  };

  const handleOpenChat = (userId: string) => {
    setSelectedUser(userId); // Set the selected user
    setIsChatOpen(true); // Open the chat window
  };

  const users = [
    { id: "1", name: "John Doe", lastMessage: "Good to hear from you!" },
    { id: "2", name: "Jane Smith", lastMessage: "Let’s catch up soon!" },
    { id: "3", name: "Alex Brown", lastMessage: "Can you send me the files?" },
  ];

  // Scroll to bottom when new message is sent
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Layout className="h-screen">
      {/* Sidebar */}
      <Sider width={250} className="bg-gray-100">
        <div className="p-4">
          <Title level={3}>Messages</Title>
        </div>
        <div
          className="cursor-pointer p-4"
          onClick={() => handleOpenChat("1")}
        >
          <div className="flex items-center gap-2">
            <Avatar>J</Avatar>
            <div className="font-semibold">John Doe</div>
          </div>
          <div className="text-gray-500 text-sm">Good to hear from you!</div>
        </div>
      </Sider>

      {/* Main Chat Frame */}
      <Layout style={{ flexDirection: "column" }}>
        <Content className="p-6 flex-1 flex flex-col">
          {selectedUser && isChatOpen ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between mb-4">
                <Space>
                  <Avatar>{users.find((user) => user.id === selectedUser)?.name[0]}</Avatar>
                  <div className="text-lg font-semibold">
                    {users.find((user) => user.id === selectedUser)?.name}
                  </div>
                </Space>
                {/* Close Button */}
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={handleCloseChat}
                  className="text-gray-500"
                />
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-auto mb-4 space-y-4">
                <div className="space-y-4">
                  {messages.map((item) => (
                    <div
                      key={item.id}
                      className={`flex ${item.isSender ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`p-3 rounded-lg text-white ${
                          item.isSender ? "bg-blue-500" : "bg-gray-300"
                        }`}
                      >
                        {item.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={chatEndRef} />
              </div>

              {/* Message Input Area */}
              <div className="bg-white p-4 sticky bottom-0 z-10">
                <div className="flex items-center space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message"
                    className="flex-1"
                    size="large"
                  />
                  <Button
                    type="primary"
                    onClick={handleSendMessage}
                    icon={<MessageOutlined />}
                    size="large"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400">Select a user to start chatting.</div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Messages;
