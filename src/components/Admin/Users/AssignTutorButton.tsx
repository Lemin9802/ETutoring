import { UserListType } from "@/types/Users";
import { Button, Modal, Select, message } from "antd";
import { useEffect, useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import { useSession } from "next-auth/react";

interface AssignTutorButtonProps {
  selectedUsers: UserListType[];
}

const { Option } = Select;

const AssignTutorButton: React.FC<AssignTutorButtonProps> = ({
  selectedUsers,
}) => {
  const { data: session } = useSession();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<string | null>(null);
  const [tutors, setTutors] = useState<{ id: string; email: string }[]>(
    () => []
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await fetch("/api/moderators/users/get-all-tutors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page: 1, size: 10 }),
        });

        const result = await response.json();
        if (response.ok) {
          setTutors(result.data);
        } else {
          message.error("Failed to fetch tutors.");
        }
      } catch (error) {
        console.error("Network error while fetching tutors:", error);
        message.error("Network error while fetching tutors.");
      }
    };

    fetchTutors();
  }, []);

  const handleAssign = async () => {
    if (!selectedTutor || selectedUsers.length === 0) {
      message.error("Please select a tutor and at least one student.");
      return;
    }

    setIsLoading(true); // Bắt đầu loading

    try {
      const response = await fetch("/api/moderators/users/assign-multi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_ids: selectedUsers.map((user) => user.id),
          tutor_id: selectedTutor,
          assigned_by: session?.user?.id,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        if (result?.success === true) {
          message.success(result.message || "Assigned tutor successfully.");
        } else if (result?.success === false) {
          message.error(result.message);
        }
      } else {
        message.error(result.message || "Failed to assign tutor.");
      }
    } catch (error) {
      console.error("Network error while assigning tutor:", error);
      message.error("Network error while assigning tutor.");
    }

    setIsLoading(false); // Kết thúc loading
    setIsModalVisible(false);
  };

  return (
    <>
      <Button
        type="primary"
        icon={<FaUserPlus />}
        onClick={() => setIsModalVisible(true)}
        loading={isLoading} // Hiển thị trạng thái loading
      >
        Assign Tutor
      </Button>

      <Modal
        title="Assign Tutor"
        open={isModalVisible}
        onOk={handleAssign}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={isLoading} // Loading trên nút OK
        okButtonProps={{ disabled: isLoading }} // Disable khi loading
        cancelButtonProps={{ disabled: isLoading }} // Disable khi loading
      >
        <Select
          className="w-full mb-4"
          placeholder="Select a Tutor"
          onChange={setSelectedTutor}
          disabled={isLoading} // Disable select khi loading
        >
          {(tutors ?? []).map((tutor) => (
            <Option key={tutor.id} value={tutor.id}>
              {tutor.email}
            </Option>
          ))}
        </Select>
      </Modal>
    </>
  );
};

export default AssignTutorButton;
