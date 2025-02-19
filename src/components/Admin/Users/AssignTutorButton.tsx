import { UserListType } from "@/types/Users";
import { Button, Modal, Select, message } from "antd";
import { useState } from "react";
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

  const handleAssign = () => {
    if (!selectedTutor || selectedUsers.length === 0) {
      message.error("Please select a tutor and at least one student.");
      return;
    }
    message.success(
      `Assigned ${selectedTutor} to ${selectedUsers.length} students.`
    );
    setIsModalVisible(false);
  };

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
          {selectedUsers
            .filter((user) => user.role === "tutor")
            .map((tutor) => (
              <Option key={tutor.id} value={tutor.name}>
                {tutor.name}
              </Option>
            ))}
        </Select>
      </Modal>
    </>
  );
};

export default AssignTutorButton;
