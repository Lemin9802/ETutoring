import React, { useState } from "react";
import { message, Modal, Form, Input, DatePicker, Button } from "antd";
// import scheduleSession from "@/pages/api/meetings/schedule-session"; // Removing direct import, will use API handler in pages directory
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
import { useSession } from "next-auth/react";
import type { RangePickerProps } from "antd/es/date-picker";

interface ScheduleSessionModalProps {
    studentId: string;
    onClose: () => void;
    onSessionScheduled: () => void;
}

const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({
    studentId,
    onClose,
    onSessionScheduled,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();
    const token = session?.user?.accessToken;

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            const { title, description, timeRange } = values;
            // Format dates to UTC ISO string
            const startTime = dayjs(timeRange[0]).utc().toISOString();
            const endTime = dayjs(timeRange[1]).utc().toISOString();

            const apiUrl = `/api/meetings/schedule-session`;

            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Include token here
                },
                body: JSON.stringify({
                    title: `Tutoring Session: ${title}`, // Default title, can be customized
                    description: description,
                    start_time: startTime, // Changed to startTime to match backend
                    end_time: endTime, // Changed to endTime to match backend
                    receiver_id: studentId, // Changed to receiverId to match backend
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Failed to schedule session."
                );
            }

            message.success("Session scheduled successfully!");
            onSessionScheduled(); // Notify parent component about successful scheduling
            onClose(); // Close the modal
        } catch (error: unknown) {
            let errorMessage = "Failed to schedule session.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const disabledDateTime: RangePickerProps["disabledTime"] = () => ({
        disabledSeconds: () => [],
        disabledMinutes: () => [],
        disabledHours: () => [],
    });


    return (
        <Modal
            title="Schedule Session"
            open={true} // Open is always true as visibility is controlled by parent
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                >
                    Schedule Session
                </Button>,
            ]}
            width={700}
        >
            <Form form={form} layout="vertical" name="scheduleSessionForm">
                <Form.Item
                    name="title"
                    label="Title"
                    rules={[{ required: true, message: "Please enter a title" }]}
                >
                    <Input placeholder="Enter session title" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description (Optional)"
                >
                    <Input.TextArea rows={4} placeholder="Enter session description" />
                </Form.Item>

                <Form.Item
                    name="timeRange"
                    label="Time Range"
                    rules={[
                        { required: true, message: "Please select start and end time" },
                    ]}
                >
                    <DatePicker.RangePicker
                        style={{ width: "100%" }}
                        showTime={{ format: 'HH:mm' }}
                        format="YYYY-MM-DD HH:mm"
                        disabledTime={disabledDateTime}
                        showNow={false}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ScheduleSessionModal;