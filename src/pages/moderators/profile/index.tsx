import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Avatar, Card, Divider, Spin, Tag, Button, 
  Descriptions, Typography, Row, Col, Modal, Form, Input, Select, DatePicker, message 
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import moment from "moment";

const { Title, Text } = Typography;
const { Option } = Select;

export type UserRole = "student" | "tutor" | "moderator";

export interface UserListType {
  id: string;
  full_name: string;
  email: string;
  date_of_birth: Date;
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

const Profile = () => {
  const { data: session, status } = useSession();
  const [userDetails, setUserDetails] = useState<UserListType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm();

  const userRole = session?.user?.roles?.toLowerCase();

  useEffect(() => {
    if (status === "authenticated") {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch("/api/moderators/users/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: session.user.id }),
          });
          const result = await response.json();
          if (response.ok) {
            setUserDetails(result);
          } else {
            console.error("Error fetching user details:", result.error);
          }
        } catch (error) {
          console.error("Network error:", error);
        }
        setLoading(false);
      };
      fetchUserProfile();
    }
  }, [session, status]);

  // Mở Modal Update
  const showModal = () => {
    setIsModalOpen(true);
    form.setFieldsValue({
      full_name: userDetails?.full_name,
      phone_number: userDetails?.phone_number,
      gender: userDetails?.gender,
      address: userDetails?.address,
      nationality: userDetails?.nationality,
      date_of_birth: userDetails?.date_of_birth ? moment(userDetails.date_of_birth) : null,
    });
  };

  // Đóng Modal
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Gửi form cập nhật thông tin
  const handleUpdate = async (values: Partial<UserListType>) => {
    console.log("Updated Data:", values);
  
    try {
      const response = await fetch("/api/moderators/users/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userDetails?.id,
          ...values,
          date_of_birth: values.date_of_birth
            ? new Date(values.date_of_birth).toISOString().split("T")[0]
            : null, // Chuyển về format YYYY-MM-DD
        }),
      });
  
      const result = await response.json();
      if (response.ok) {
        message.success("Profile updated successfully!");
                setUserDetails((prev) => {
          if (!prev) return null;
  
          return {
            ...prev,
            ...values,
            date_of_birth: values.date_of_birth ? new Date(values.date_of_birth) : prev.date_of_birth,
          };
        });
  
        setIsModalOpen(false);
      } else {
        message.error(result?.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Network error");
    }
  };  
  
  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Text>No user data found</Text>
      </div>
    );
  }

  return (
    <Row justify="center" className="p-6 min-h-screen bg-gray-100">
      <Col xs={24} sm={20} md={16} lg={12}>
        <Card className="shadow-lg">
          {/* Header */}
          <Row justify="space-between" align="middle">
            <Title level={2}>My Profile</Title>
            <Button type="primary" icon={<EditOutlined />} size="large" onClick={showModal}>
              Update Profile
            </Button>
          </Row>

          <Divider />

          {/* Avatar & User Info */}
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <Avatar
                src={userDetails?.profile_picture || undefined}
                size={100}
                className="border-4 border-gray-300"
              >
                {!userDetails.profile_picture && userDetails.full_name?.[0]}
              </Avatar>
            </Col>
            <Col>
              <Title level={3}>{userDetails.full_name || "N/A"}</Title>
              <Text type="secondary">{userDetails.email || "N/A"}</Text>
              {userRole && (
                <Tag color={userRole.includes("student") ? "blue" : userRole.includes("tutor") ? "purple" : "red"}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Tag>
              )}
              {/* <Tag color={userDetails.is_active ? "green" : "red"}>
                {userDetails.is_active ? "Active" : "Inactive"}
              </Tag> */}
            </Col>
          </Row>

          <Divider />

          {/* User Details */}
          <Descriptions title="User Information" bordered column={1} size="middle">
            <Descriptions.Item label="Gender">{userDetails.gender || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Phone Number">{userDetails.phone_number || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Nationality">{userDetails.nationality || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Address">{userDetails.address || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Date of Birth">{userDetails.date_of_birth ? moment(userDetails.date_of_birth).format("DD/MM/YYYY") : "N/A"}</Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      {/* Modal Update Profile */}
      <Modal title="Update Profile" visible={isModalOpen} onCancel={handleCancel} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone_number" label="Phone Number">
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="Gender">
            <Select>
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
            </Select>
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input />
          </Form.Item>
          <Form.Item name="date_of_birth" label="Date of Birth">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
};

export default Profile;
