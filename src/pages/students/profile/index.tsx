import { EditOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Form, Input,
  message,
  Modal,
  Row,
  Select,
  Spin, Tag,
  Typography
} from "antd";
import moment from "moment";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

export type UserRole = "student" | "tutor" | "moderator";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  date_of_birth: string | null;
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

const Profile: React.FC = () => {
  const { data: session, status } = useSession();
  const [userDetails, setUserDetails] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserProfile();
    }
  }, [status]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/profile/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: session?.user?.id }),
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

  // Hiển thị Modal cập nhật
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

  // Xử lý cập nhật hồ sơ
  const handleUpdate = async (values: Partial<UserProfile>) => {
    confirm({
      title: "Confirm Update",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to update your profile?",
      onOk: async () => {
        try {
          const updatedFields = Object.fromEntries(
            Object.entries(values).filter(([, v]) => v !== undefined && v !== null)
          );
  
          const response = await fetch("/api/profile/update-profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.user?.accessToken}`,
            },
            body: JSON.stringify({
              id: userDetails?.id,
              ...updatedFields, // Send only fields that have changed
            }),
          });
  
          const result = await response.json();
  
          if (response.ok) {
            message.success("Profile updated successfully!");
            setUserDetails((prev) => prev ? { ...prev, ...updatedFields } : prev);
            setIsModalOpen(false);
          } else {
            message.error(result?.message || "Failed to update profile!");
          }
        } catch (error) {
          console.error("Error:", error);
          message.error("Network error, please try again!");
        }
      },
    });
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
        <Text>Không tìm thấy dữ liệu người dùng</Text>
      </div>
    );
  }

  return (
    <Row justify="center" className="p-6 min-h-screen bg-gray-100">
      <Col xs={24} sm={20} md={16} lg={12}>
        <Card className="shadow-lg">
          <Row justify="space-between" align="middle">
            <Title level={2}>Profile</Title>
            <Button type="primary" icon={<EditOutlined />} size="large" onClick={showModal}>
              Update Profile
            </Button>
          </Row>
  
          <Divider />
  
          <Row gutter={[16, 16]} align="middle">
            <Col>
              <Avatar
                src={userDetails?.profile_picture || "/default-avatar.png"}
                size={100}
                className="border-4 border-gray-300"
              >
                {!userDetails.profile_picture && userDetails.full_name?.[0]}
              </Avatar>
            </Col>
            <Col>
              <Title level={3}>{userDetails.full_name || userDetails.email || "N/A"}</Title>
              <Tag color="blue">{session?.user?.roles}</Tag>
            </Col>
          </Row>
  
          <Divider />
  
          <Descriptions title="User Information" bordered column={1} size="middle">
            <Descriptions.Item label="Gender">{userDetails.gender || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Phone Number">{userDetails.phone_number || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Nationality">{userDetails.nationality || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Address">{userDetails.address || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Date of Birth">
              {userDetails.date_of_birth ? moment(userDetails.date_of_birth).format("DD/MM/YYYY") : "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
  
      <Modal title="Update Profile" open={isModalOpen} onCancel={handleCancel} footer={null}>
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
          <Form.Item name="date_of_birth" label="Date of Birth">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Save</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );  
};

export default Profile;
