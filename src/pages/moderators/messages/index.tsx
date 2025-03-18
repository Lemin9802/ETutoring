// import React, { useState, useEffect } from 'react';
// //import { useSession } from 'next-auth/react';
// import {
//   Card,
//   Table,
//   Button,
//   Space,
//   Modal,
//   Input,
//   Form,
//   //Select,
//   message,
//   Tag,
// } from 'antd';
// import type { TableColumnsType, TablePaginationConfig } from 'antd';
// import type { FilterValue, SorterResult, TableCurrentDataSource } from 'antd/es/table/interface';
// import {
//   DeleteOutlined,
//   ExclamationCircleOutlined,
//   StopOutlined,
//   UserSwitchOutlined,
// } from '@ant-design/icons';
// import { ChatRoom, ChatRoomStatus } from '@/types/Chat';

// interface ChatRoomFormValues {
//   studentId: string;
//   studentName: string;
//   tutorId: string;
//   tutorName: string;
// }

// // interface TableParams {
// //   pagination?: TablePaginationConfig;
// //   sortField?: string;
// //   sortOrder?: string;
// //   filters?: Record<string, FilterValue | null>;
// // }

// const ModeratorMessagesPage: React.FC = () => {
//   //const { data: session } = useSession();
//   const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [assignModalVisible, setAssignModalVisible] = useState(false);
//   const [form] = Form.useForm();


//   // Mock data for testing
//   useEffect(() => {
//     setChatRooms([
//       {
//         id: '1',
//         studentId: 'student1',
//         studentName: 'John Student',
//         tutorId: 'tutor1',
//         tutorName: 'Jane Tutor',
//         lastMessageTime: new Date(),
//         status: 'active' as ChatRoomStatus,
//         reportCount: 0,
//         messageCount: 0,
//         createdAt: new Date(),
//         updatedAt: new Date()
//       },
//       {
//         id: '2',
//         studentId: 'student2',
//         studentName: 'Alice Student',
//         tutorId: 'tutor2',
//         tutorName: 'Bob Tutor',
//         lastMessageTime: new Date(Date.now() - 3600000),
//         status: 'active' as ChatRoomStatus,
//         reportCount: 2,
//         messageCount: 15,
//         createdAt: new Date(Date.now() - 86400000),
//         updatedAt: new Date(Date.now() - 3600000)
//       },
//     ]);
//     setLoading(false);
//   }, []);

//   const handleDeleteChat = (chatId: string) => {
//     Modal.confirm({
//       title: 'Are you sure you want to delete this chat?',
//       icon: <ExclamationCircleOutlined />,
//       content: 'This action cannot be undone.',
//       okText: 'Yes',
//       okType: 'danger',
//       cancelText: 'No',
//       onOk() {
//         // Mock deletion
//         setChatRooms(chatRooms.filter((room) => room.id !== chatId));
//         message.success('Chat deleted successfully');
//       },
//     });
//   };

//   const handleSuspendChat = (chatId: string) => {
//     Modal.confirm({
//       title: 'Are you sure you want to suspend this chat?',
//       icon: <ExclamationCircleOutlined />,
//       content: 'Users will not be able to send messages while suspended.',
//       okText: 'Yes',
//       okType: 'danger',
//       cancelText: 'No',
//       onOk() {
//         // Mock suspension
//         setChatRooms(
//           chatRooms.map((room) =>
//             room.id === chatId
//               ? { ...room, status: 'suspended' as ChatRoomStatus }
//               : room
//           )
//         );
//         message.success('Chat suspended successfully');
//       },
//     });
//   };

//   const handleAssignChat = async (values: ChatRoomFormValues) => {
//     // Mock assignment
//     const newRoom: ChatRoom = {
//       id: Date.now().toString(),
//       studentId: values.studentId,
//       studentName: values.studentName,
//       tutorId: values.tutorId,
//       tutorName: values.tutorName,
//       lastMessageTime: new Date(),
//       status: 'active' as ChatRoomStatus,
//       reportCount: 0,
//       messageCount: 0,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     setChatRooms([...chatRooms, newRoom]);
//     setAssignModalVisible(false);
//     form.resetFields();
//     message.success('Chat room assigned successfully');
//   };

//   const handleTableChange = (
//     pagination: TablePaginationConfig,
//     filters: Record<string, FilterValue | null>,
//     sorter: SorterResult<ChatRoom> | SorterResult<ChatRoom>[],
//     extra: TableCurrentDataSource<ChatRoom>
//   ) => {
//     // Handle table changes here
//     console.log('Table params changed:', { pagination, filters, sorter, extra });
//   };

//   const columns: TableColumnsType<ChatRoom> = [
//     {
//       title: 'Student',
//       dataIndex: 'studentName',
//       key: 'studentName',
//     },
//     {
//       title: 'Tutor',
//       dataIndex: 'tutorName',
//       key: 'tutorName',
//     },
//     {
//       title: 'Last Activity',
//       dataIndex: 'lastMessageTime',
//       key: 'lastMessageTime',
//       render: (date: Date) => new Date(date).toLocaleString(),
//     },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//       key: 'status',
//       render: (status: string) => (
//         <Tag
//           color={
//             status === 'active'
//               ? 'green'
//               : status === 'suspended'
//               ? 'red'
//               : 'default'
//           }
//         >
//           {status.toUpperCase()}
//         </Tag>
//       ),
//     },
//     {
//       title: 'Reports',
//       dataIndex: 'reportCount',
//       key: 'reportCount',
//       render: (count: number) => (
//         <Tag color={count > 0 ? 'red' : 'default'}>{count}</Tag>
//       ),
//     },
//     {
//       title: 'Messages',
//       dataIndex: 'messageCount',
//       key: 'messageCount',
//       render: (count: number) => count,
//     },
//     {
//       title: 'Action',
//       key: 'action',
//       render: (_, record) => (
//         <Space size="middle">
//           <Button
//             type="text"
//             danger
//             icon={<DeleteOutlined />}
//             onClick={() => handleDeleteChat(record.id)}
//           />
//           <Button
//             type="text"
//             danger
//             icon={<StopOutlined />}
//             onClick={() => handleSuspendChat(record.id)}
//           />
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <Card className="shadow-lg">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold">Chat Moderation</h2>
//           <Button
//             type="primary"
//             icon={<UserSwitchOutlined />}
//             onClick={() => setAssignModalVisible(true)}
//           >
//             Assign Chat Room
//           </Button>
//         </div>

//         <Table
//           columns={columns}
//           dataSource={chatRooms}
//           loading={loading}
//           onChange={handleTableChange}
//         />

//         <Modal
//           title="Assign Chat Room"
//           visible={assignModalVisible}
//           onCancel={() => setAssignModalVisible(false)}
//           footer={null}
//         >
//           <Form form={form} onFinish={handleAssignChat} layout="vertical">
//             <Form.Item
//               name="studentId"
//               label="Student ID"
//               rules={[{ required: true }]}
//             >
//               <Input />
//             </Form.Item>
//             <Form.Item
//               name="studentName"
//               label="Student Name"
//               rules={[{ required: true }]}
//             >
//               <Input />
//             </Form.Item>
//             <Form.Item
//               name="tutorId"
//               label="Tutor ID"
//               rules={[{ required: true }]}
//             >
//               <Input />
//             </Form.Item>
//             <Form.Item
//               name="tutorName"
//               label="Tutor Name"
//               rules={[{ required: true }]}
//             >
//               <Input />
//             </Form.Item>
//             <Form.Item>
//               <Button type="primary" htmlType="submit">
//                 Create Chat Room
//               </Button>
//             </Form.Item>
//           </Form>
//         </Modal>
//       </Card>
//     </div>
//   );
// };

// export default ModeratorMessagesPage; 