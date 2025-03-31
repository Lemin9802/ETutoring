import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Input,
  message,
  Tag,
  Tabs,
  Badge,
} from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import ChatBox from "@/components/Chat/ChatBox";

// Kiểu ChatRoom tương ứng với response của API
export type ChatRoom = {
  id: string;
  student_id: string;
  student_name: string;
  tutor_id: string;
  tutor_name: string;
  created_at: string;
  number_of_messages: number;
  last_activity: string | null;
  number_of_reports: number;
  // Bạn có thể bổ sung các trường khác nếu cần
};

const ChatManagementPage = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<ChatRoom | null>(null);
  const [viewChatModalVisible, setViewChatModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Lấy danh sách chatroom từ API get-all
  const fetchChatRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/moderators/chatrooms/get-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_number: pagination.current,
          page_size: pagination.pageSize,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setChatRooms(result.data);
        setPagination((prev) => ({
          ...prev,
          total: result.meta.total_items,
        }));
      } else {
        message.error(result.message || "Failed to fetch chat rooms");
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      message.error("Failed to fetch chat rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination(newPagination);
  };

  // Xoá chatroom: gọi API delete với { chatroom_id }
  const handleDeleteChat = (chatId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this chat?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const res = await fetch("/api/moderators/chatrooms/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatroom_id: chatId }),
          });
          const result = await res.json();
          if (result.success) {
            setChatRooms(chatRooms.filter((room) => room.id !== chatId));
            message.success("Chat deleted successfully");
          } else {
            message.error(result.message || "Failed to delete chat");
          }
        } catch (error) {
          console.error("Error deleting chat:", error);
          message.error("Failed to delete chat");
        }
      },
    });
  };

  // Suspend chat: gọi API update-status với { chatroom_id, is_active: false }
  const handleSuspendChat = (chatId: string) => {
    Modal.confirm({
      title: "Are you sure you want to suspend this chat?",
      icon: <ExclamationCircleOutlined />,
      content: "Users will not be able to send messages while suspended.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const res = await fetch("/api/moderators/chatrooms/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chatroom_id: chatId,
              is_active: false,
            }),
          });
          const result = await res.json();
          if (!result.success) {
            message.error(result.message || "Failed to suspend chat");
          }
        } catch (error) {
          console.error("Error suspending chat:", error);
          message.error("Failed to suspend chat");
        }
      },
    });
  };

  // Lấy chi tiết chatroom: gọi API get-by-id với { chatroom_id }
  const handleViewChat = async (chatId: string) => {
    try {
      const res = await fetch("/api/moderators/chatrooms/get-by-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatroom_id: chatId }),
      });
      const result = await res.json();
      if (result.success) {
        setActiveChat(result.data);
        setViewChatModalVisible(true);
      } else {
        message.error(result.message || "Failed to fetch chat details");
      }
    } catch (error) {
      console.error("Error fetching chat details:", error);
      message.error("Failed to fetch chat details");
    }
  };

  const columns: TableColumnsType<ChatRoom> = [
    {
      title: "Student",
      dataIndex: "student_name",
      key: "student_name",
    },
    {
      title: "Tutor",
      dataIndex: "tutor_name",
      key: "tutor_name",
    },
    {
      title: "Messages",
      dataIndex: "number_of_messages",
      key: "number_of_messages",
      render: (count: number) => (
        <Badge count={count} style={{ backgroundColor: "#52c41a" }} />
      ),
    },
    {
      title: "Last Activity",
      dataIndex: "last_activity",
      key: "last_activity",
      render: (date: string | null) =>
        date ? new Date(date).toLocaleString() : "",
      sorter: (a, b) =>
        new Date(a.last_activity || "").getTime() -
        new Date(b.last_activity || "").getTime(),
    },
    {
      title: "Reports",
      dataIndex: "number_of_reports",
      key: "number_of_reports",
      render: (count: number) => (
        <Tag color={count > 0 ? "red" : "default"}>{count}</Tag>
      ),
      sorter: (a, b) => a.number_of_reports - b.number_of_reports,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewChat(record.id)}
          />
          <Button
            type="text"
            danger
            icon={<StopOutlined />}
            onClick={() => handleSuspendChat(record.id)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteChat(record.id)}
          />
        </Space>
      ),
    },
  ];

  // Lọc chatrooms theo search query
  const filteredChatRooms = chatRooms.filter(
    (room) =>
      room.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.tutor_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="shadow-lg">
        <div className="mb-4">
          <Input.Search
            placeholder="Search by student or tutor name..."
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Tabs
          defaultActiveKey="all"
          items={[
            {
              key: "all",
              label: "All Chats",
              children: (
                <Table
                  columns={columns}
                  dataSource={filteredChatRooms}
                  loading={loading}
                  rowKey="id"
                  pagination={pagination}
                  onChange={handleTableChange}
                />
              ),
            },
            {
              key: "reported",
              label: (
                <span>
                  Reported{" "}
                  <Badge
                    count={
                      chatRooms.filter(
                        (room) => room.number_of_reports > 0
                      ).length
                    }
                    style={{ backgroundColor: "#ff4d4f" }}
                  />
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={chatRooms.filter(
                    (room) => room.number_of_reports > 0
                  )}
                  loading={loading}
                  rowKey="id"
                  pagination={pagination}
                  onChange={handleTableChange}
                />
              ),
            },
          ]}
        />

        <Modal
          title="Chat Details"
          open={viewChatModalVisible}
          onCancel={() => setViewChatModalVisible(false)}
          width={1000}
          footer={null}
        >
          {activeChat && (
            <div className="flex h-[70vh] bg-white rounded-lg overflow-hidden">
              {/* Sidebar danh sách chat */}
              <div className="w-72 border-r border-gray-200 overflow-y-auto bg-gray-50">
                {chatRooms.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-100 border-l-4 ${
                      chat.id === activeChat.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-transparent"
                    }`}
                    onClick={() => setActiveChat(chat)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-800">
                        {chat.student_name}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      Tutor: {chat.tutor_name}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <span className="mr-2">🕒</span>
                      {chat.last_activity
                        ? new Date(chat.last_activity).toLocaleString()
                        : ""}
                    </div>
                  </div>
                ))}
              </div>

              {/* Nội dung chat */}
              <div className="flex-1 flex flex-col bg-white">
                <div className="flex justify-between items-center p-6 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                        Student
                      </div>
                      <div className="font-medium text-gray-800">
                        {activeChat.student_name}
                      </div>
                    </div>
                    <div className="h-10 border-l border-gray-200" />
                    <div className="text-center">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                        Tutor
                      </div>
                      <div className="font-medium text-gray-800">
                        {activeChat.tutor_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Last Activity
                    </div>
                    <div className="font-medium text-gray-800">
                      {activeChat.last_activity
                        ? new Date(activeChat.last_activity).toLocaleString()
                        : ""}
                    </div>
                  </div>
                </div>

                <div className="flex-1 border-t flex overflow-hidden">
                  <ChatBox
                    chatId={activeChat.id}
                    recipientId={activeChat.student_id}
                    recipientName={activeChat.student_name}
                    recipientAvatar={undefined}
                    isFullPage={false}
                  />
                </div>
              </div>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default ChatManagementPage;
