import { Button, Modal, Select, message } from "antd";
import { useEffect, useState } from "react";
import { FaUserEdit } from "react-icons/fa";

// Mảng role cố định dựa trên bảng Role
const roleOptions = [
    {
        id: "0194b0b1-587e-7ea9-b82d-e894bb669981",
        name: "Moderator",
    },
    {
        id: "0194b0b1-588c-71e7-98f6-2d66862bbb48",
        name: "Tutor",
    },
    {
        id: "0194b0b1-58d1-7bbe-b850-88b18ce3a819",
        name: "Student",
    },
];

const AssignRoleButton: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [users, setUsers] = useState<{ id: string; email: string }[]>([]);
    const [, setTotal] = useState<number>(0);

    // Hàm fetch danh sách user
    const fetchUsers = async (page: number, size: number) => {
        try {
            const response = await fetch("/api/moderators/users/get-all-students-tutors", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ page, size }),
            });
            const result = await response.json();
            if (response.ok) {
                setUsers(result.data);
                setTotal(result.total);
            } else {
                console.error("Error fetching users:", result.error);
                message.error("Có lỗi khi tải danh sách user.");
            }
        } catch (error) {
            console.error("Network error:", error);
            message.error("Lỗi mạng khi tải danh sách user.");
        }
    };

    useEffect(() => {
        fetchUsers(1, 10);
    }, []);

    // Xử lý khi nhấn OK trong modal
    const handleAssign = async () => {
        if (!selectedUser || !selectedRole) {
            message.error("Vui lòng chọn user và role.");
            return;
        }

        const payload = {
            userId: selectedUser,
            roleId: selectedRole,
        };

        try {
            const response = await fetch("/api/admin/users/assign-role", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (response.ok) {
                message.success(result.message || "Gán role thành công.");
                setIsModalVisible(false);
                // Reset lựa chọn
                setSelectedUser(null);
                setSelectedRole(null);
            } else {
                message.error(result.error || "Có lỗi khi gán role.");
            }
        } catch (error) {
            console.error("Network error:", error);
            message.error("Lỗi mạng khi gán role.");
        }
    };

    return (
        <>
            <Button
                type="primary"
                icon={<FaUserEdit />}
                onClick={() => setIsModalVisible(true)}
            >
                Assign Role
            </Button>

            <Modal
                title="Assign Role"
                open={isModalVisible}
                onOk={handleAssign}
                onCancel={() => setIsModalVisible(false)}
            >
                <Select
                    className="w-full mb-4"
                    placeholder="Select a User"
                    value={selectedUser || undefined}
                    onChange={setSelectedUser}
                    showSearch
                    filterOption={(inputValue, option) =>
                        (option?.label as string)
                            ?.toLowerCase()
                            .includes(inputValue.toLowerCase())
                    }
                >
                    {users.map((user) => (
                        <Select.Option
                            key={user.id}
                            value={user.id}
                            label={user.email} // Quan trọng: truyền label để filter
                        >
                            {user.email}
                        </Select.Option>
                    ))}
                </Select>

                <Select
                    className="w-full"
                    placeholder="Select a Role"
                    value={selectedRole || undefined}
                    onChange={setSelectedRole}
                >
                    {roleOptions.map((role) => (
                        <Select.Option
                            key={role.id}
                            value={role.id}
                            label={role.name}
                        >
                            {role.name}
                        </Select.Option>
                    ))}
                </Select>
            </Modal>
        </>
    );
};

export default AssignRoleButton;
