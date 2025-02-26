import React, { useState, useEffect } from 'react';
//import { useSession } from 'next-auth/react';
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
} from 'antd';
import type { TableColumnsType, TablePaginationConfig } from 'antd';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import ChatBox from '@/components/Chat/ChatBox';
import { ChatRoom } from '@/types/Chat';

const ChatManagementPage = () => {
  //const { data: session } = useSession();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [viewChatModalVisible, setViewChatModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchChatRooms = async () => {
    setLoading(true);
    try {
      // Mock data for testing
      setChatRooms([
        {
          id: '1',
          studentId: 'student1',
          studentName: 'John Student',
          studentAvatar: undefined,
          tutorId: 'tutor1',
          tutorName: 'Jane Tutor',
          tutorAvatar: undefined,
          lastMessageTime: new Date(),
          status: 'active',
          reportCount: 0,
          messageCount: 25,
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(),
        },
        {
          id: '2',
          studentId: 'student2',
          studentName: 'Alice Student',
          studentAvatar: undefined,
          tutorId: 'tutor2',
          tutorName: 'Bob Tutor',
          tutorAvatar: undefined,
          lastMessageTime: new Date(Date.now() - 3600000),
          status: 'active',
          reportCount: 2,
          messageCount: 15,
          createdAt: new Date(Date.now() - 172800000),
          updatedAt: new Date(Date.now() - 3600000),
        },
      ]);
      setPagination(prev => ({ ...prev, total: 2 }));
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      message.error('Failed to fetch chat rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination(newPagination);
    fetchChatRooms();
  };

  const handleDeleteChat = (chatId: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this chat?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          // TODO: Replace with actual API call
          // await fetch(`/api/moderators/chat-rooms/${chatId}`, {
          //   method: 'DELETE',
          // });
          setChatRooms(chatRooms.filter((room) => room.id !== chatId));
          message.success('Chat deleted successfully');
        } catch (error) {
          console.error('Error deleting chat:', error);
          message.error('Failed to delete chat');
        }
      },
    });
  };

  const handleSuspendChat = (chatId: string) => {
    Modal.confirm({
      title: 'Are you sure you want to suspend this chat?',
      icon: <ExclamationCircleOutlined />,
      content: 'Users will not be able to send messages while suspended.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          // TODO: Replace with actual API call
          // await fetch(`/api/moderators/chat-rooms/${chatId}/suspend`, {
          //   method: 'POST',
          // });
          setChatRooms(
            chatRooms.map((room) =>
              room.id === chatId
                ? { ...room, status: 'suspended' as const }
                : room
            )
          );
          message.success('Chat suspended successfully');
        } catch (error) {
          console.error('Error suspending chat:', error);
          message.error('Failed to suspend chat');
        }
      },
    });
  };

  const handleViewChat = (chat: ChatRoom) => {
    setSelectedChat(chat);
    setViewChatModalVisible(true);
  };

  const columns: TableColumnsType<ChatRoom> = [
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName',
      filterSearch: true,
      filters: [],
      onFilter: (value, record) =>
        record.studentName.toLowerCase().includes(value.toString().toLowerCase()),
    },
    {
      title: 'Tutor',
      dataIndex: 'tutorName',
      key: 'tutorName',
      filterSearch: true,
      filters: [],
      onFilter: (value, record) =>
        record.tutorName.toLowerCase().includes(value.toString().toLowerCase()),
    },
    {
      title: 'Messages',
      dataIndex: 'messageCount',
      key: 'messageCount',
      render: (count: number) => (
        <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Last Activity',
      dataIndex: 'lastMessageTime',
      key: 'lastMessageTime',
      render: (date: Date) => new Date(date).toLocaleString(),
      sorter: (a, b) => a.lastMessageTime.getTime() - b.lastMessageTime.getTime(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          color={
            status === 'active'
              ? 'green'
              : status === 'suspended'
              ? 'red'
              : 'default'
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Suspended', value: 'suspended' },
        { text: 'Closed', value: 'closed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Reports',
      dataIndex: 'reportCount',
      key: 'reportCount',
      render: (count: number) => (
        <Tag color={count > 0 ? 'red' : 'default'}>{count}</Tag>
      ),
      sorter: (a, b) => a.reportCount - b.reportCount,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewChat(record)}
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
              key: 'all',
              label: 'All Chats',
              children: (
                <Table
                  columns={columns}
                  dataSource={chatRooms.filter(
                    (room) =>
                      room.studentName
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      room.tutorName
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )}
                  loading={loading}
                  rowKey="id"
                  pagination={pagination}
                  onChange={handleTableChange}
                />
              ),
            },
            {
              key: 'reported',
              label: (
                <span>
                  Reported{' '}
                  <Badge
                    count={chatRooms.filter((room) => room.reportCount > 0).length}
                    style={{ backgroundColor: '#ff4d4f' }}
                  />
                </span>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={chatRooms.filter((room) => room.reportCount > 0)}
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
          title={`Chat: ${selectedChat?.studentName} - ${selectedChat?.tutorName}`}
          visible={viewChatModalVisible}
          onCancel={() => setViewChatModalVisible(false)}
          width={800}
          footer={null}
        >
          {selectedChat && (
            <ChatBox
              chatId={selectedChat.id}
              recipientId={selectedChat.studentId}
              recipientName={selectedChat.studentName}
              recipientAvatar={selectedChat.studentAvatar}
              isFullPage={false}
            />
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default ChatManagementPage; 