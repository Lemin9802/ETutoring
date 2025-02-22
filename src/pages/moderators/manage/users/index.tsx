import AssignTutorButton from "@/components/Admin/Users/AssignTutorButton";
import ScheduleMeetingButton from "@/components/Admin/Users/ScheduleMeetingButton";
import SendEmailButton from "@/components/Admin/Users/SendEmailButton";
import { Avatar, Card, Input, Modal, Space, Spin, Table, TableColumnsType, TableProps, Tag } from "antd";
import moment from "moment";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useState } from "react";
export type UserRole = "student" | "tutor" | "moderator";
export interface UserListType {
  id: string;
  full_name: string;
  name: string;
  email: string;
  date_of_birth: string;
  gender: string;
  address: string;
  phone_number: string;
  profile_picture: string | null;
  nationality: string;
  identification_number: string;
  is_email_confirmed: boolean;
  is_phone_confirmed: boolean;
 role: UserRole;
  is_active: boolean;
  last_login_time: string | null;
  
}

const AdminUserListPage = () => {
  const { data: session } = useSession();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<UserListType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userDetails, setUserDetails] = useState<UserListType | null>(null);
  const [total, setTotal] = useState(0);
  const fetchUsers = async (page: number, size: number) => {
    setLoading(true);
    try {
      const response = await fetch("/api/moderators/users/get-all-students", {
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
      }
    } catch (error) {
      console.error("Network error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!session) return;
    fetchUsers(1, 2); 
  }, [session]);

  const selectedUsers = useMemo(() => {
    return users.filter((user) => selectedRowKeys.includes(user.id));
  }, [selectedRowKeys, users]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys.map(String));
  };

  const rowSelection: TableProps<UserListType>["rowSelection"] = {
    selectedRowKeys,
    onChange: onSelectChange,
    preserveSelectedRowKeys: true,
  };

  const columns: TableColumnsType<UserListType> = [
    {
      title: "Full Name",
      dataIndex: "full_name",
      render: (text) => text || "N/A",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Last Login",
      dataIndex: "last_login_time",
      render: (date) =>
        date ? moment(date).format("DD/MM/YYYY HH:mm") : "Never logged in",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      render: (isActive) =>
        isActive ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: "Action",
      render: (_text, record) => (
        <a onClick={() => handleViewDetails(record.id)}>Details</a>
      ),
    },
  ];

  const handleViewDetails = async (userId: string) => {
    try {
      const response = await fetch("/api/moderators/users/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userId }),
      });
  
      const result = await response.json();
      
      if (response.ok) {
        setUserDetails(result);
        setIsModalVisible(true);
      } else {
        console.error("Error fetching user details:", result.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };
  

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };
  const handlePaginationChange = (page: number, pageSize: number) => {
    fetchUsers(page, pageSize);
  };
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Card className="shadow-lg mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ Bulk Actions</h2>
        <Input placeholder="Search users..." allowClear onChange={(e) => setSearchQuery(e.target.value)} className="mb-4" />
        <Space>
          <AssignTutorButton selectedUsers={selectedUsers} />
          <SendEmailButton selectedUsers={selectedUsers} allUsers={users} />
          <ScheduleMeetingButton selectedUsers={selectedUsers} />
        </Space>
      </Card>
      <Table rowSelection={rowSelection} columns={columns} dataSource={filteredUsers} loading={loading} pagination={{
          total: total,
          onChange: handlePaginationChange,
        }} rowKey="id" />

      {/* Modal for User Details */}
      <Modal
        title="User Details"
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        className="rounded-lg"
      >
        {userDetails ? (
          <div className="space-y-6 p-4">
            <div className="flex items-center space-x-4">
              <Avatar
                src={userDetails?.profile_picture || undefined}
                size={64}
                className="border-2 border-gray-300"
              >
                {!userDetails.profile_picture && userDetails.full_name?.[0]}
              </Avatar>
              <div>
                <p className="text-xl font-semibold text-gray-800">{userDetails.full_name || "N/A"}</p>
                <p className="text-sm text-gray-500">{userDetails.email || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <p className="font-medium text-gray-600">Gender:</p>
                <p>{userDetails.gender || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Phone Number:</p>
                <p>{userDetails.phone_number || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Nationality:</p>
                <p>{userDetails.nationality || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Identification Number:</p>
                <p>{userDetails.identification_number || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Address:</p>
                <p>{userDetails.address || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Date of Birth:</p>
                <p>{userDetails.date_of_birth !== "0001-01-01T00:00:00" ? moment(userDetails.date_of_birth).format("DD/MM/YYYY") : "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Email Confirmed:</p>
                <p>{userDetails.is_email_confirmed ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Phone Confirmed:</p>
                <p>{userDetails.is_phone_confirmed ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Role:</p>
                <p>{userDetails.role || "N/A"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Status:</p>
                <p>{userDetails.is_active ? "Active" : "Inactive"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Last Login:</p>
                <p>{userDetails.last_login_time ? moment(userDetails.last_login_time).format("DD/MM/YYYY HH:mm") : "Never logged in"}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <Spin size="large" />
          </div>  
        )}
      </Modal>
    </div>
  );
};

export default ModeratorUserListPage; 