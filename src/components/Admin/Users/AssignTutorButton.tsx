import { UserListType } from "@/types/Users";
import { Button, Modal, Select, message } from "antd";
import { useEffect, useState } from "react";
import { FaUserPlus } from "react-icons/fa";

interface AssignTutorButtonProps {
  selectedUsers: UserListType[];
}

const { Option } = Select;

const AssignTutorButton: React.FC<AssignTutorButtonProps> = ({
  selectedUsers,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<string | null>(null);
  const [tutors, setTutors] = useState<{ id: string; email: string }[]>([]);
  const [total, setTotal] = useState<number>(0);

  const fetchTutors = async (page: number, size: number) => {
    try {
      const response = await fetch("/api/moderators/users/get-all-tutors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page, size }),
      });

      const result = await response.json();
      if (response.ok) {
        setTutors(result.data);
        setTotal(result.total);
      } else {
        console.error("Error fetching tutors:", result.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  useEffect(() => {
    fetchTutors(1, 10);
  }, []);

  const handleAssign = () => {
    if (!selectedTutor || selectedUsers.length === 0) {
      message.error("Please select a tutor and at least one student.");
      return;
    }
    message.success(
      `Assigned "${selectedTutor}" to ${selectedUsers.length} students.`
    );
    setIsModalVisible(false);
  };

  console.log("Total: ", total);

  return (
    <>
      <Button
        type="primary"
        icon={<FaUserPlus />}
        onClick={() => setIsModalVisible(true)}
      >
        Assign Tutor
      </Button>

      <Modal
        title="Assign Tutor"
        open={isModalVisible}
        onOk={handleAssign}
        onCancel={() => setIsModalVisible(false)}
      >
        <Select
          className="w-full mb-4"
          placeholder="Select a Tutor"
          onChange={setSelectedTutor}
        >
          {tutors?.map((tutor) => (
            <Option key={tutor.id} value={tutor.email}>
              {tutor.email} {/* Hiển thị email vì full_name rỗng */}
            </Option>
          ))}
        </Select>
      </Modal>
    </>
  );
};

export default AssignTutorButton;
