import React, { useState } from "react";
import axios from "axios";
import { Modal, Form, Input, DatePicker, Button, message } from "antd";
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

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            const { title, description, timeRange } = values;

            const startTime = timeRange[0].toISOString();
            const endTime = timeRange[1].toISOString();


            const response = await axios.post("/api/meetings/create", {
                title: `Tutoring Session: ${title}`,
                description: description,
                startTime: startTime,
                endTime: endTime,
                receiverId: studentId,
            });

            if (response.status === 200) {
                message.success("Session scheduled successfully!");
                onSessionScheduled();
                onClose();
            } else {
                message.error("Failed to schedule session.");
            }
        } catch (error) {
            message.error("Failed to schedule session.");
            console.error("Error scheduling session:", error);
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