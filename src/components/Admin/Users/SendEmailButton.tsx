import { UserListType } from "@/types/Users";
import { Button, Modal, Select, message } from "antd";
import { useState, useEffect } from "react";
import { FaEnvelope } from "react-icons/fa";

const { Option } = Select;

interface SendEmailButtonProps {
  selectedUsers: UserListType[];
  allUsers: UserListType[]; // Pass all users for the "Send to All" option
}

const SendEmailButton: React.FC<SendEmailButtonProps> = ({
  selectedUsers,
  allUsers,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [emailType, setEmailType] = useState<string | null>(null);
  const [sendToAll, setSendToAll] = useState<boolean>(false);
  const [recipients, setRecipients] = useState<UserListType[]>([]);

  // Update recipient list when "Send to All" is toggled
  useEffect(() => {
    setRecipients(sendToAll ? allUsers : selectedUsers);
  }, [sendToAll, selectedUsers, allUsers]);

  const handleSendEmails = () => {
    if (!emailType) {
      message.error("Please select an email type.");
      return;
    }
    if (recipients.length === 0) {
      message.error("Please select at least one user.");
      return;
    }

    message.success(`Sent "${emailType}" email to ${recipients.length} users.`);
    setIsModalVisible(false);
  };

  return (
    <>
      <Button
        type="default"
        icon={<FaEnvelope />}
        onClick={() => setIsModalVisible(true)}
      >
        Send Email
      </Button>

      <Modal
        title="Send Emails"
        open={isModalVisible}
        onOk={handleSendEmails}
        onCancel={() => setIsModalVisible(false)}
      >
        {/* Select Email Type */}
        <Select
          className="w-full mb-4"
          placeholder="Select Email Type"
          onChange={setEmailType}
        >
          <Option value="Reminder">Reminder</Option>
          <Option value="Announcement">Announcement</Option>
          <Option value="Custom">Custom Message</Option>
        </Select>

        {/* Send to All Users Checkbox */}
        <label className="mb-4 block">
          <input
            type="checkbox"
            className="mr-2"
            checked={sendToAll}
            onChange={(e) => setSendToAll(e.target.checked)}
          />
          Send to all users in the system
        </label>

        {/* Display Recipients */}
        <p>Emails will be sent to:</p>
        <ul className="max-h-40 overflow-auto bg-gray-100 p-2 rounded-md">
          {recipients.length > 20 ? (
            <li className="text-gray-700 font-semibold">
              Sending to {recipients.length}+ people
            </li>
          ) : recipients.length > 0 ? (
            recipients.map((user) => (
              <li key={user.id}>
                {user.name} ({user.email})
              </li>
            ))
          ) : (
            <li className="text-gray-500 italic">No users selected</li>
          )}
        </ul>
      </Modal>
    </>
  );
};

export default SendEmailButton;
