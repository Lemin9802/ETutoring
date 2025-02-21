import React, { useState, useEffect } from "react";
import { Button, Space, Table, Tag, Modal, Form, Input, Select } from "antd";
import type { TableProps } from "antd";
import { EditOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { getTutors, getStudents, getStudentTutors, getTutorStudents } from "../../data/API";
import { UserListType, UserRole } from "@/types/Users";

interface UserListProps {
    data: UserListType[];
    role: UserRole;
    onAssociateUsers?: (selectedUsers: string[], targetUser: string) => void;
}

interface EditFormValues extends UserListType {
    targetUsers: string[];
}

const UserList: React.FC<UserListProps> = ({
    data,
    role,
    onAssociateUsers,
}) => {
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserListType | null>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchText, setSearchText] = useState("");
    const [associatedUsers, setAssociatedUsers] = useState<UserListType[]>([]);
    const [availableUsers, setAvailableUsers] = useState<UserListType[]>([]);
    const [form] = Form.useForm();

    // Fetch available users for associations when edit modal opens
    useEffect(() => {
        if (editModalVisible && selectedUser) {
            const fetchAvailableUsers = async () => {
                try {
                    const users = role === 'student' 
                        ? await getTutors() 
                        : await getStudents();
                    setAvailableUsers(users);
                    
                    // Get current associations
                    const associatedUsers = role === 'student'
                        ? getStudentTutors(selectedUser.id)
                        : getTutorStudents(selectedUser.id);
                    
                    // Set the initial values for the form
                    form.setFieldsValue({
                        ...selectedUser,
                        targetUsers: associatedUsers.map(user => user.id)
                    });
                } catch (error) {
                    console.error('Error fetching available users:', error);
                    setAvailableUsers([]);
                }
            };
            fetchAvailableUsers();
        }
    }, [editModalVisible, selectedUser, form, role]);

    const filteredData = data.filter(
        (user) =>
            user.name.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email.toLowerCase().includes(searchText.toLowerCase())
    );

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
    };

    const handleViewUser = (user: UserListType) => {
        setSelectedUser(user);
        fetchAssociatedUsers(user);
        setViewModalVisible(true);
    };

    const fetchAssociatedUsers = async (user: UserListType) => {
        try {
            const associatedUsersList = role === 'student'
                ? getStudentTutors(user.id)
                : getTutorStudents(user.id);
            setAssociatedUsers(associatedUsersList);
        } catch (error) {
            console.error('Error fetching associated users:', error);
            setAssociatedUsers([]);
        }
    };

    const columns: TableProps<UserListType>["columns"] = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text) => <a>{text}</a>,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (role) => (
                <Tag color="blue">
                    {role.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewUser(record)}
                    />
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setSelectedUser(record);
                            setEditModalVisible(true);
                        }}
                    />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            setSelectedUser(record);
                            setDeleteModalVisible(true);
                        }}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Input.Search
                placeholder="Search by name or email"
                style={{ marginBottom: 16 }}
                onSearch={(value) => setSearchText(value)}
                onChange={(e) => setSearchText(e.target.value)}
            />

            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
            />

            {/* View Modal */}
            <Modal
                title="View User Details"
                open={viewModalVisible}
                onCancel={() => {
                    setViewModalVisible(false);
                    setAssociatedUsers([]);
                }}
                footer={[
                    <Button key="close" onClick={() => {
                        setViewModalVisible(false);
                        setAssociatedUsers([]);
                    }}>
                        Close
                    </Button>,
                ]}
            >
                {selectedUser && (
                    <div className="user-details">
                        <h3>User Information</h3>
                        <p>
                            <strong>Name:</strong> {selectedUser.name}
                        </p>
                        <p>
                            <strong>Email:</strong> {selectedUser.email}
                        </p>
                        <p>
                            <strong>Role:</strong>{" "}
                            <Tag color="blue">
                                {selectedUser.role.toUpperCase()}
                            </Tag>
                        </p>
                        <p>
                            <strong>Address:</strong> {selectedUser.address}
                        </p>

                        {associatedUsers.length > 0 && (
                            <>
                                <h3>Associated {role === "student" ? "Tutors" : "Students"}</h3>
                                <div>
                                    {associatedUsers.map((user) => (
                                        <Tag key={user.id}>
                                            {user.name}
                                        </Tag>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal
                title="Edit User"
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={(values: EditFormValues) => {
                        if (selectedUser && onAssociateUsers) {
                            onAssociateUsers(values.targetUsers, selectedUser.id);
                        }
                        setEditModalVisible(false);
                        form.resetFields();
                    }}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, type: "email" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Address"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="targetUsers"
                        label={`Associated ${role === "student" ? "Tutors" : "Students"}`}
                    >
                        <Select
                            mode="multiple"
                            placeholder={`Select ${role === "student" ? "tutors" : "students"} to associate`}
                            style={{ width: "100%" }}
                            options={availableUsers.map((user) => ({
                                label: user.name,
                                value: user.id,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Save Changes
                            </Button>
                            <Button
                                onClick={() => {
                                    setEditModalVisible(false);
                                    form.resetFields();
                                }}
                            >
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Delete Modal */}
            <Modal
                title="Delete User"
                open={deleteModalVisible}
                onOk={() => {
                    // Handle delete logic here
                    setDeleteModalVisible(false);
                }}
                onCancel={() => setDeleteModalVisible(false)}
            >
                <p>Are you sure you want to delete this user?</p>
            </Modal>
        </div>
    );
};

export default UserList;
