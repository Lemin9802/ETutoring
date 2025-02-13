import { UserListType } from "@/types/Users";
import { Button, Modal, DatePicker, TimePicker, Select, message } from "antd";
import { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";

const { Option } = Select;

interface ScheduleMeetingButtonProps {
  selectedUsers: UserListType[];
}

const ScheduleMeetingButton: React.FC<ScheduleMeetingButtonProps> = ({
  selectedUsers,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [meetingDate, setMeetingDate] = useState<string | null>(null);
  const [meetingTime, setMeetingTime] = useState<string | null>(null);

  // Filter out tutors and students from selected users
  const tutors = selectedUsers.filter((user) => user.role === "tutor");
  const students = selectedUsers.filter((user) => user.role === "student");

  const handleScheduleMeeting = () => {
    if (
      !selectedTutor ||
      selectedStudents.length === 0 ||
      !meetingDate ||
      !meetingTime
    ) {
      message.error("Please select a tutor, students, date, and time.");
      return;
    }

    message.success(
      `Meeting scheduled with ${selectedStudents.length} students and ${selectedTutor} on ${meetingDate} at ${meetingTime}.`
    );

    setIsModalVisible(false);
  };

  return (
    <>
      <Button
        type="dashed"
        icon={<FaCalendarAlt />}
        onClick={() => setIsModalVisible(true)}
      >
        Schedule Meeting
      </Button>

      <Modal
        title="Schedule Meeting"
        open={isModalVisible}
        onOk={handleScheduleMeeting}
        onCancel={() => setIsModalVisible(false)}
      >
        {/* Select Tutor */}
        <Select
          className="w-full mb-4"
          placeholder="Select a Tutor"
          onChange={setSelectedTutor}
        >
          {tutors.map((tutor) => (
            <Option key={tutor.id} value={tutor.name}>
              {tutor.name}
            </Option>
          ))}
        </Select>

        {/* Select Students */}
        <Select
          className="w-full mb-4"
          placeholder="Select Students"
          mode="multiple"
          onChange={setSelectedStudents}
        >
          {students.map((student) => (
            <Option key={student.id} value={student.name}>
              {student.name}
            </Option>
          ))}
        </Select>

        {/* Select Date */}
        <DatePicker
          className="w-full mb-2"
          onChange={(date, dateString) =>
            setMeetingDate(
              Array.isArray(dateString) ? dateString[0] : dateString
            )
          }
        />

        {/* Select Time */}
        <TimePicker
          className="w-full"
          format="HH:mm"
          onChange={(time, timeString) =>
            setMeetingTime(
              Array.isArray(timeString) ? timeString[0] : timeString
            )
          }
        />
      </Modal>
    </>
  );
};

export default ScheduleMeetingButton;
