import {
  ArrowLeftOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Space,
  Steps,
  TimePicker,
  Typography
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Meeting } from "./types";

const { TextArea } = Input;

interface AddMeetingModalProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (meeting: Omit<Meeting, "id">) => void;
  initialDate?: Dayjs | null;
}

const AddMeetingModal: React.FC<AddMeetingModalProps> = ({
  visible,
  onCancel,
  onAdd,
  initialDate = null,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  // Reset form and set initial date when modal is opened
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setCurrentStep(0);
      if (initialDate) {
        setSelectedDate(initialDate);
        form.setFieldsValue({
          meetingDate: initialDate,
        });
      }
    }
  }, [visible, initialDate, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Process form values
      const {
        title,
        description,
        meetingDate,
        timeRange,
        location,
        attendees,
      } = values;

      // Create meeting object with combined date and time
      const startDateTime = meetingDate
        .hour(timeRange[0].hour())
        .minute(timeRange[0].minute());
      const endDateTime = meetingDate
        .hour(timeRange[1].hour())
        .minute(timeRange[1].minute());

      const meeting: Omit<Meeting, "id"> = {
        title,
        description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location,
        attendees: attendees || [],
      };

      onAdd(meeting);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = () => {
    form
      .validateFields(["meetingDate"])
      .then((values) => {
        setSelectedDate(values.meetingDate);
        setCurrentStep(1);
      })
      .catch((error) => {
        console.error("Date validation failed:", error);
      });
  };

  const handleBackToDateSelection = () => {
    setCurrentStep(0);
  };

  // First step - Date selection
  const renderDateSelection = () => (
    <>
      <Form.Item
        name="meetingDate"
        label="Select Meeting Date"
        rules={[{ required: true, message: "Please select a date" }]}
      >
        <DatePicker
          style={{ width: "100%" }}
          disabledDate={(date) => date.isBefore(dayjs().startOf("day"))}
          format="YYYY-MM-DD"
        />
      </Form.Item>
      <Button type="primary" onClick={handleDateSelect}>
        Next
      </Button>
    </>
  );

  // Second step - Time and details
  const renderTimeAndDetails = () => (
    <>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          style={{ marginRight: 8 }}
          onClick={handleBackToDateSelection}
        >
          Back
        </Button>
        <Typography.Text strong>
          Meeting date: {selectedDate?.format("YYYY-MM-DD")}
        </Typography.Text>
      </div>

      <Form.Item
        name="title"
        label="Meeting Title"
        rules={[{ required: true, message: "Please enter a meeting title" }]}
      >
        <Input placeholder="Enter meeting title" />
      </Form.Item>

      <Form.Item
        name="timeRange"
        label="Time Range"
        rules={[
          { required: true, message: "Please select start and end time" },
        ]}
      >
        <TimePicker.RangePicker format="HH:mm" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="location" label="Location">
        <Input placeholder="Enter meeting location (optional)" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[
          { required: true, message: "Please enter a meeting description" },
        ]}
      >
        <TextArea rows={4} placeholder="Enter meeting description" />
      </Form.Item>

      <Typography.Title level={5}>Attendees</Typography.Title>

      <Form.List name="attendees">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space
                key={key}
                style={{ display: "flex", marginBottom: 8 }}
                align="baseline"
              >
                <Form.Item
                  {...restField}
                  name={[name, "name"]}
                  rules={[{ required: true, message: "Missing name" }]}
                >
                  <Input placeholder="Name" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "email"]}
                  rules={[
                    { required: true, message: "Missing email" },
                    { type: "email", message: "Invalid email format" },
                  ]}
                >
                  <Input placeholder="Email" />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Add Attendee
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  );

  return (
    <Modal
      title="Add New Meeting"
      open={visible}
      onCancel={onCancel}
      footer={
        currentStep === 0
          ? [
              <Button key="cancel" onClick={onCancel}>
                Cancel
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={onCancel}>
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={loading}
                onClick={handleSubmit}
              >
                Add Meeting
              </Button>,
            ]
      }
      width={700}
    >
      <Steps
        current={currentStep}
        items={[{ title: "Select Date" }, { title: "Set Time & Details" }]}
        style={{ marginBottom: 24 }}
      />

      <Form form={form} layout="vertical" name="addMeetingForm">
        {currentStep === 0 ? renderDateSelection() : renderTimeAndDetails()}
      </Form>
    </Modal>
  );
};

export default AddMeetingModal;
