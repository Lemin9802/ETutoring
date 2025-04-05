import { Button, Modal, Select, message } from "antd";
import { useEffect, useState } from "react";
import { FaUserEdit } from "react-icons/fa";

interface User {
  id: string;
  email: string;
}

interface Role {
  id: string;
  name: string;
}

const AssignRoleButton: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
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

  // Hàm fetch danh sách role
  const fetchRoles = async (pageNumber: number, pageSize: number) => {
    try {
      const response = await fetch("/api/admin/users/get-list-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pageNumber, pageSize }),
      });
      const result = await response.json();
      if (response.ok) {
        setRoles(result.data);
      } else {
        console.error("Error fetching roles:", result.error);
        message.error("Có lỗi khi tải danh sách role.");
      }
    } catch (error) {
      console.error("Network error:", error);
      message.error("Lỗi mạng khi tải danh sách role.");
    }
  };

  useEffect(() => {
    fetchUsers(1, 10);
    fetchRoles(1, 10);
  }, []);

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
            (option?.label as string)?.toLowerCase().includes(inputValue.toLowerCase())
          }
        >
          {users.map((user) => (
            <Select.Option key={user.id} value={user.id} label={user.email}>
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
          {roles.map((role) => (
            <Select.Option key={role.id} value={role.id} label={role.name}>
              {role.name}
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </>
  );
};

export default AssignRoleButton;
