// import React, { useState, useEffect } from "react";
// //import { useSession } from 'next-auth/react';
// import {
//   Card,
//   Table,
//   Button,
//   Space,
//   Modal,
//   Input,
//   message,
//   Tag,
//   Tabs,
//   Badge,
// } from "antd";
// import type { TableColumnsType, TablePaginationConfig } from "antd";
// import {
//   DeleteOutlined,
//   ExclamationCircleOutlined,
//   StopOutlined,
//   EyeOutlined,
// } from "@ant-design/icons";
// import ChatBox from "@/components/Chat/ChatBox";
// import { ChatRoom } from "@/types/Chat";

// const ChatManagementPage = () => {
//   //const { data: session } = useSession();
//   const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedChats, setSelectedChats] = useState<ChatRoom[]>([]);
//   const [activeChat, setActiveChat] = useState<ChatRoom | null>(null);
//   const [viewChatModalVisible, setViewChatModalVisible] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [pagination, setPagination] = useState<TablePaginationConfig>({
//     current: 1,
//     pageSize: 10,
//     total: 0,
//   });

//   const fetchChatRooms = async () => {
//     setLoading(true);
//     try {
//       // Mock data for testing
//       setChatRooms([
//         {
//           id: "1",
//           studentId: "student1",
//           studentName: "John Student",
//           studentAvatar: undefined,
//           tutorId: "tutor1",
//           tutorName: "Jane Tutor",
//           tutorAvatar: undefined,
//           lastMessageTime: new Date(),
//           status: "active",
//           reportCount: 0,
//           messageCount: 25,
//           createdAt: new Date(Date.now() - 86400000),
//           updatedAt: new Date(),
//         },
//         {
//           id: "2",
//           studentId: "student2",
//           studentName: "Alice Student",
//           studentAvatar: undefined,
//           tutorId: "tutor2",
//           tutorName: "Bob Tutor",
//           tutorAvatar: undefined,
//           lastMessageTime: new Date(Date.now() - 3600000),
//           status: "active",
//           reportCount: 2,
//           messageCount: 15,
//           createdAt: new Date(Date.now() - 172800000),
//           updatedAt: new Date(Date.now() - 3600000),
//         },
//       ]);
//       setPagination((prev) => ({ ...prev, total: 2 }));
//     } catch (error) {
//       console.error("Error fetching chat rooms:", error);
//       message.error("Failed to fetch chat rooms");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchChatRooms();
//   }, []);

//   const handleTableChange = (newPagination: TablePaginationConfig) => {
//     setPagination(newPagination);
//     fetchChatRooms();
//   };

//   const handleDeleteChat = (chatId: string) => {
//     Modal.confirm({
//       title: "Are you sure you want to delete this chat?",
//       icon: <ExclamationCircleOutlined />,
//       content: "This action cannot be undone.",
//       okText: "Yes",
//       okType: "danger",
//       cancelText: "No",
//       onOk: async () => {
//         try {
//           // TODO: Replace with actual API call
//           // await fetch(`/api/moderators/chat-rooms/${chatId}`, {
//           //   method: 'DELETE',
//           // });
//           setChatRooms(chatRooms.filter((room) => room.id !== chatId));
//           message.success("Chat deleted successfully");
//         } catch (error) {
//           console.error("Error deleting chat:", error);
//           message.error("Failed to delete chat");
//         }
//       },
//     });
//   };

//   const handleSuspendChat = (chatId: string) => {
//     Modal.confirm({
//       title: "Are you sure you want to suspend this chat?",
//       icon: <ExclamationCircleOutlined />,
//       content: "Users will not be able to send messages while suspended.",
//       okText: "Yes",
//       okType: "danger",
//       cancelText: "No",
//       onOk: async () => {
//         try {
//           // TODO: Replace with actual API call
//           // await fetch(`/api/moderators/chat-rooms/${chatId}/suspend`, {
//           //   method: 'POST',
//           // });
//           setChatRooms(
//             chatRooms.map((room) =>
//               room.id === chatId
//                 ? { ...room, status: "suspended" as const }
//                 : room
//             )
//           );
//           message.success("Chat suspended successfully");
//         } catch (error) {
//           console.error("Error suspending chat:", error);
//           message.error("Failed to suspend chat");
//         }
//       },
//     });
//   };

//   const handleViewChat = (chat: ChatRoom) => {
//     if (!selectedChats.find((c) => c.id === chat.id)) {
//       setSelectedChats([...selectedChats, chat]);
//     }
//     setActiveChat(chat);
//     setViewChatModalVisible(true);
//   };

//   const columns: TableColumnsType<ChatRoom> = [
//     {
//       title: "Student",
//       dataIndex: "studentName",
//       key: "studentName",
//       filterSearch: true,
//       filters: [],
//       onFilter: (value, record) =>
//         record.studentName
//           .toLowerCase()
//           .includes(value.toString().toLowerCase()),
//     },
//     {
//       title: "Tutor",
//       dataIndex: "tutorName",
//       key: "tutorName",
//       filterSearch: true,
//       filters: [],
//       onFilter: (value, record) =>
//         record.tutorName.toLowerCase().includes(value.toString().toLowerCase()),
//     },
//     {
//       title: "Messages",
//       dataIndex: "messageCount",
//       key: "messageCount",
//       render: (count: number) => (
//         <Badge count={count} style={{ backgroundColor: "#52c41a" }} />
//       ),
//     },
//     {
//       title: "Last Activity",
//       dataIndex: "lastMessageTime",
//       key: "lastMessageTime",
//       render: (date: Date) => new Date(date).toLocaleString(),
//       sorter: (a, b) =>
//         a.lastMessageTime.getTime() - b.lastMessageTime.getTime(),
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       key: "status",
//       render: (status: string) => (
//         <Tag
//           color={
//             status === "active"
//               ? "green"
//               : status === "suspended"
//               ? "red"
//               : "default"
//           }
//         >
//           {status.toUpperCase()}
//         </Tag>
//       ),
//       filters: [
//         { text: "Active", value: "active" },
//         { text: "Suspended", value: "suspended" },
//         { text: "Closed", value: "closed" },
//       ],
//       onFilter: (value, record) => record.status === value,
//     },
//     {
//       title: "Reports",
//       dataIndex: "reportCount",
//       key: "reportCount",
//       render: (count: number) => (
//         <Tag color={count > 0 ? "red" : "default"}>{count}</Tag>
//       ),
//       sorter: (a, b) => a.reportCount - b.reportCount,
//     },
//     {
//       title: "Action",
//       key: "action",
//       render: (_, record) => (
//         <Space size="middle">
//           <Button
//             type="text"
//             icon={<EyeOutlined />}
//             onClick={() => handleViewChat(record)}
//             className="hover:bg-blue-50 hover:text-blue-600 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
//           />
//           <Button
//             type="text"
//             danger
//             icon={<StopOutlined />}
//             onClick={() => handleSuspendChat(record.id)}
//             className="hover:bg-red-50 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
//           />
//           <Button
//             type="text"
//             danger
//             icon={<DeleteOutlined />}
//             onClick={() => handleDeleteChat(record.id)}
//             className="hover:bg-red-50 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
//           />
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <Card className="shadow-lg">
//         <div className="mb-4">
//           <Input.Search
//             placeholder="Search by student or tutor name..."
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="max-w-md"
//           />
//         </div>

//         <Tabs
//           defaultActiveKey="all"
//           items={[
//             {
//               key: "all",
//               label: "All Chats",
//               children: (
//                 <Table
//                   columns={columns}
//                   dataSource={chatRooms.filter(
//                     (room) =>
//                       room.studentName
//                         .toLowerCase()
//                         .includes(searchQuery.toLowerCase()) ||
//                       room.tutorName
//                         .toLowerCase()
//                         .includes(searchQuery.toLowerCase())
//                   )}
//                   loading={loading}
//                   rowKey="id"
//                   pagination={pagination}
//                   onChange={handleTableChange}
//                 />
//               ),
//             },
//             {
//               key: "reported",
//               label: (
//                 <span>
//                   Reported{" "}
//                   <Badge
//                     count={
//                       chatRooms.filter((room) => room.reportCount > 0).length
//                     }
//                     style={{ backgroundColor: "#ff4d4f" }}
//                   />
//                 </span>
//               ),
//               children: (
//                 <Table
//                   columns={columns}
//                   dataSource={chatRooms.filter((room) => room.reportCount > 0)}
//                   loading={loading}
//                   rowKey="id"
//                   pagination={pagination}
//                   onChange={handleTableChange}
//                 />
//               ),
//             },
//           ]}
//         />

//         <Modal
//           title={
//             <div className="flex items-center justify-between">
//               <span>Chat Details</span>
//               {activeChat?.status === "suspended" && (
//                 <Tag color="red">SUSPENDED</Tag>
//               )}
//             </div>
//           }
//           open={viewChatModalVisible}
//           onCancel={() => setViewChatModalVisible(false)}
//           width={1000}
//           footer={
//             <div className="flex justify-between items-center p-3 bg-gray-50 border-t border-gray-200">
//               <div className="flex space-x-2">
//                 <Tag
//                   color="blue"
//                   className="px-3 py-1 flex items-center rounded-full"
//                 >
//                   <span className="mr-1">📅</span> Created:{" "}
//                   {activeChat?.createdAt.toLocaleString()}
//                 </Tag>
//                 <Tag
//                   color="green"
//                   className="px-3 py-1 flex items-center rounded-full"
//                 >
//                   <span className="mr-1">💬</span> Messages:{" "}
//                   {activeChat?.messageCount}
//                 </Tag>
//                 <Tag
//                   color={activeChat?.reportCount ? "red" : "default"}
//                   className="px-3 py-1 flex items-center rounded-full"
//                 >
//                   <span className="mr-1">
//                     {activeChat?.reportCount ? "⚠️" : "✓"}
//                   </span>{" "}
//                   Reports: {activeChat?.reportCount}
//                 </Tag>
//               </div>
//               <Space>
//                 <Button
//                   danger
//                   type="primary"
//                   icon={<StopOutlined />}
//                   onClick={() => {
//                     setViewChatModalVisible(false);
//                     handleSuspendChat(activeChat?.id || "");
//                   }}
//                   disabled={activeChat?.status === "suspended"}
//                   className="rounded-md shadow-sm hover:shadow-md transition-all duration-200"
//                 >
//                   Suspend Chat
//                 </Button>
//                 <Button
//                   danger
//                   icon={<DeleteOutlined />}
//                   onClick={() => {
//                     setViewChatModalVisible(false);
//                     handleDeleteChat(activeChat?.id || "");
//                   }}
//                   className="rounded-md shadow-sm hover:shadow-md transition-all duration-200"
//                 >
//                   Delete Chat
//                 </Button>
//               </Space>
//             </div>
//           }
//           className="chat-modal"
//           styles={{ body: { padding: 0 } }}
//         >
//           {activeChat && selectedChats.length > 0 && (
//             <div className="flex h-[70vh] bg-white rounded-lg overflow-hidden">
//               <div className="w-72 border-r border-gray-200 overflow-y-auto bg-gray-50">
//                 {selectedChats.map((chat) => (
//                   <div
//                     key={chat.id}
//                     className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-100 border-l-4 ${
//                       chat.id === activeChat?.id
//                         ? "border-blue-500 bg-blue-50"
//                         : "border-transparent"
//                     }`}
//                     onClick={() => setActiveChat(chat)}
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <div className="font-semibold text-gray-800">
//                         {chat.studentName}
//                       </div>
//                       {chat.status === "suspended" && (
//                         <Tag
//                           color="red"
//                           className="uppercase text-xs font-bold"
//                         >
//                           Suspended
//                         </Tag>
//                       )}
//                     </div>
//                     <div className="text-sm text-gray-600 mb-1">
//                       Tutor: {chat.tutorName}
//                     </div>
//                     <div className="text-xs text-gray-400 flex items-center">
//                       <span className="mr-2">🕒</span>
//                       {new Date(chat.lastMessageTime).toLocaleString()}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="flex-1 flex flex-col bg-white">
//                 <div className="flex justify-between items-center p-6 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
//                   <div className="flex items-center space-x-6">
//                     <div className="text-center">
//                       <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
//                         Student
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {activeChat.studentName}
//                       </div>
//                     </div>
//                     <div className="h-10 border-l border-gray-200" />
//                     <div className="text-center">
//                       <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
//                         Tutor
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {activeChat.tutorName}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
//                       Last Activity
//                     </div>
//                     <div className="font-medium text-gray-800">
//                       {activeChat.lastMessageTime.toLocaleString()}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex-1 border-t flex overflow-hidden">
//                   <ChatBox
//                     chatId={activeChat.id}
//                     recipientId={activeChat.studentId}
//                     recipientName={activeChat.studentName}
//                     recipientAvatar={activeChat.studentAvatar}
//                     isFullPage={false}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}
//         </Modal>
//       </Card>
//     </div>
//   );
// };

// export default ChatManagementPage;
