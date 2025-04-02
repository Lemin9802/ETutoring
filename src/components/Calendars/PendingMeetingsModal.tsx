import React, { useEffect, useState } from "react";
import { Modal, Table, Button, Tag, Space, Typography, message } from "antd";
import { Attendee, Meeting } from "./types";
import dayjs from "dayjs";

interface PendingMeetingsModalProps {
  visible: boolean;
  onCancel: () => void;
  onStatusChange: (meetingId: string, newStatus: number) => Promise<boolean>;
  teacherEmail?: string;
  meetings: Meeting[];
}

const PendingMeetingsModal: React.FC<PendingMeetingsModalProps> = ({
  visible,
  onCancel,
  onStatusChange,
  teacherEmail,
  meetings,
}) => {
  const [pendingMeetings, setPendingMeetings] = useState<Meeting[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      filterPendingMeetings();
    }
  }, [visible, teacherEmail, meetings]);

  const filterPendingMeetings = () => {
    if (!teacherEmail) return;

    // Filter meetings that are pending (status = 0) and include the teacher as a participant
    const filtered = meetings.filter(
      (meeting) =>
        meeting.status === 0 && meeting.participants.some((participant) => participant.email === teacherEmail)
    );

    setPendingMeetings(filtered);
  };

  const handleStatusChange = async (meetingId: string, newStatus: number) => {
    try {
      setActionLoading(meetingId);

      // Call parent component's status change handler
      const success = await onStatusChange(meetingId, newStatus);

      // Update local state to remove the actioned meeting
      if (success) {
        setPendingMeetings(pendingMeetings.filter((meeting) => meeting.id !== meetingId));
      }
    } catch (error) {
      console.error("Error updating meeting status:", error);
      message.error("Failed to update meeting status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (isoString: string) => {
    return dayjs(isoString).format("MMM DD, YYYY HH:mm");
  };

  const columns = [
    {
      title: "Student",
      dataIndex: "participants",
      key: "student",
      render: (participants: Attendee[]) => {
        // Find the student participant (assuming teacher email is known and the other is the student)
        const student = participants.find((p) => p.email !== teacherEmail);
        return student ? (
          <div>
            <div>{student.full_name}</div>
            <Typography.Text type="secondary">{student.email}</Typography.Text>
          </div>
        ) : (
          "Unknown"
        );
      },
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Date & Time",
      key: "datetime",
      render: (_: unknown, record: Meeting) => (
        <div>
          <div>{formatDateTime(record.start_time)}</div>
          <div>to {formatDateTime(record.end_time)}</div>
        </div>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (location: string) => location || "Not specified",
    },
    {
      title: "Status",
      key: "status",
      render: () => <Tag color="processing">PENDING</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, record: Meeting) => (
        <Space>
          <Button
            type="primary"
            loading={actionLoading === record.id}
            onClick={() => handleStatusChange(record.id, 1)}
          >
            Approve
          </Button>
          <Button
            danger
            loading={actionLoading === record.id}
            onClick={() => handleStatusChange(record.id, 2)}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Modal title="Pending Meeting Requests" open={visible} onCancel={onCancel} footer={null} width={900}>
      <Table
        dataSource={pendingMeetings}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        locale={{ emptyText: "No pending meeting requests" }}
      />
    </Modal>
  );
};

export default PendingMeetingsModal;
