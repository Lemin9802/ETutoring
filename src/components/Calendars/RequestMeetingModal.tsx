import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Modal, Steps, TimePicker, Typography, Select, message } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Meeting, Attendee } from "./types";
import axios from "axios";

const { TextArea } = Input;
const { Option } = Select;

interface RequestMeetingModalProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (meeting: Omit<Meeting, "id">) => void;
  initialDate?: Dayjs | null;
}

const RequestMeetingModal: React.FC<RequestMeetingModalProps> = ({
  visible,
  onCancel,
  onAdd,
  initialDate = null,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [tutors, setTutors] = useState<Attendee[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(false);

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
      // Load tutors when modal opens
      fetchAssignedTutors();
    }
  }, [visible, initialDate, form]);

  const fetchAssignedTutors = async () => {
    try {
      setLoadingTutors(true);
      const bodyData = {
        page_number: 1,
        page_size: 100,
      };

      const response = await axios.post(`/api/students/get-tutors`, bodyData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.data) {
        setTutors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching assigned tutors:", error);
      message.error("Failed to load tutors. Please try again.");
      setTutors([]);
    } finally {
      setLoadingTutors(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Process form values
      const { title, description, meetingDate, timeRange, location, tutorId } = values;

      // Find selected tutor details
      const selectedTutor = tutors.find((tutor) => tutor.email === tutorId);

      if (!selectedTutor) {
        message.error("Selected tutor not found. Please try again.");
        return;
      }

      // Use the selectedDate state which was properly set when moving to step 2
      // instead of potentially new meetingDate from the form
      const dateToUse = selectedDate || meetingDate;

      // Log for debugging
      console.log("Selected date:", dateToUse?.format("YYYY-MM-DD"));
      console.log("Time range:", timeRange[0].format("HH:mm"), "-", timeRange[1].format("HH:mm"));

      // Create meeting object with combined date and time
      const startDateTime = dateToUse
        .set("hour", timeRange[0].hour())
        .set("minute", timeRange[0].minute())
        .set("second", 0);
      const endDateTime = dateToUse
        .set("hour", timeRange[1].hour())
        .set("minute", timeRange[1].minute())
        .set("second", 0);

      const meeting: Omit<Meeting, "id"> = {
        title,
        description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: location || "",
        participants: [selectedTutor],
        status: 0,
      };

      onAdd(meeting);
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
        <Button icon={<ArrowLeftOutlined />} style={{ marginRight: 8 }} onClick={handleBackToDateSelection}>
          Back
        </Button>
        <Typography.Text strong>Meeting date: {selectedDate?.format("YYYY-MM-DD")}</Typography.Text>
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
        rules={[{ required: true, message: "Please select start and end time" }]}
      >
        <TimePicker.RangePicker format="HH:mm" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="location" label="Location">
        <Input placeholder="Enter meeting location (optional)" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Please enter a meeting description" }]}
      >
        <TextArea rows={4} placeholder="Enter meeting description" />
      </Form.Item>

      <Form.Item
        name="tutorId"
        label="Select Tutor"
        rules={[{ required: true, message: "Please select a tutor" }]}
      >
        <Select placeholder="Select a tutor" loading={loadingTutors} style={{ width: "100%" }}>
          {tutors.map((tutor) => (
            <Option key={tutor.email} value={tutor.email}>
              {tutor.full_name} ({tutor.email})
            </Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );

  return (
    <Modal
      title="Request Meeting with Tutor"
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
              <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                Request Meeting
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

      <Form form={form} layout="vertical" name="requestMeetingForm">
        {currentStep === 0 ? renderDateSelection() : renderTimeAndDetails()}
      </Form>
    </Modal>
  );
};

export default RequestMeetingModal;
