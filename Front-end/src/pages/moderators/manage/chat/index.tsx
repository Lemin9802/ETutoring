import ConversationDetails, { Message } from "@/components/Chat/ConversationDetails";
import {
    DeleteOutlined,
    ExclamationCircleOutlined,
    EyeOutlined
} from "@ant-design/icons";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import {
    Badge,
    Button,
    Card,
    Input,
    message,
    Modal,
    Space,
    Table,
    Tabs,
    Tag,
} from "antd";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

export type ChatRoom = {
    message_id: string;      // Conversation id
    id: string;              // Chatroom id
    student_id: string;
    student_name: string;
    tutor_id: string;
    tutor_name: string;
    created_at: string;
    number_of_messages: number;
    last_activity: string | null;
    number_of_reports: number;
};

interface ConversationData {
    total_messages: number;
    messages: Message[];
}

const ChatManagementPage: React.FC = () => {
    useSession(); // Retain the hook call if authentication context is needed
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversationData, setSelectedConversationData] = useState<ConversationData | null>(null);
    const [viewChatModalVisible, setViewChatModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Lấy danh sách chatrooms từ API get-all
    const fetchChatRooms = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/moderators/chatrooms/get-all", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
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

    // Xoá chatroom: sử dụng chatroom_id
    const handleDeleteChat = (chatroomId: string) => {
        Modal.confirm({
            title: "Are you sure you want to delete this chat?",
            icon: <ExclamationCircleOutlined/>,
            content: "This action cannot be undone.",
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk: async () => {
                try {
                    const res = await fetch("/api/moderators/chatrooms/delete", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({chatroom_id: chatroomId}),
                    });
                    const result = await res.json();
                    if (result.success) {
                        setChatRooms(chatRooms.filter((room) => room.id !== chatroomId));
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

    // Suspend chat: sử dụng chatroom_id
    // const handleSuspendChat = (chatroomId: string) => {
    //     Modal.confirm({
    //         title: "Are you sure you want to suspend this chat?",
    //         icon: <ExclamationCircleOutlined/>,
    //         content: "Users will not be able to send messages while suspended.",
    //         okText: "Yes",
    //         okType: "danger",
    //         cancelText: "No",
    //         onOk: async () => {
    //             try {
    //                 const res = await fetch("/api/moderators/chatrooms/update-status", {
    //                     method: "POST",
    //                     headers: {"Content-Type": "application/json"},
    //                     body: JSON.stringify({
    //                         chatroom_id: chatroomId,
    //                         is_active: false,
    //                     }),
    //                 });
    //                 const result = await res.json();
    //                 if (!result.success) {
    //                     message.error(result.message || "Failed to suspend chat");
    //                 }
    //             } catch (error) {
    //                 console.error("Error suspending chat:", error);
    //                 message.error("Failed to suspend chat");
    //             }
    //         },
    //     });
    // };

    // Khi bấm xem chi tiết chat, gọi API get-by-id và lưu dữ liệu conversation vào state
    const handleViewChat = async (chatroomId: string) => {
        try {
            const res = await fetch("/api/moderators/chatrooms/get-by-id", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({chatroom_id: chatroomId}),
            });
            const result = await res.json();
            if (result.success) {
                // Giả sử API trả về dữ liệu dạng: { data: { total_messages, messages: [...] } }
                setSelectedConversationData(result.data);
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
                <Badge count={count} style={{backgroundColor: "#52c41a"}}/>
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
                        icon={<EyeOutlined/>}
                        onClick={() => handleViewChat(record.id)} // record.id là chatroom_id
                    />
                    {/*<Button*/}
                    {/*    type="text"*/}
                    {/*    danger*/}
                    {/*    icon={<StopOutlined/>}*/}
                    {/*    onClick={() => handleSuspendChat(record.id)}*/}
                    {/*/>*/}
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined/>}
                        onClick={() => handleDeleteChat(record.id)}
                    />
                </Space>
            ),
        },
    ];

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
                                            chatRooms.filter((room) => room.number_of_reports > 0)
                                                .length
                                        }
                                        style={{backgroundColor: "#ff4d4f"}}
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
                    title="Conversation Details"
                    open={viewChatModalVisible}
                    onCancel={() => setViewChatModalVisible(false)}
                    width={1000}
                    footer={null}
                >
                    <ConversationDetails conversationData={selectedConversationData} loading={loading}
                                         currentUserId={""}/>
                </Modal>
            </Card>
        </div>
    );
};

export default ChatManagementPage;
