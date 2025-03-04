import React, { useState } from 'react';
import { Avatar, Badge, Table, Typography, Button, Modal, Form, Input, Upload, Select, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

interface DataType {
  key: string;
  title?: string;
  author?: string;
  status?: string;
  recipients?: string[];
  updated?: string;
  isGroupHeader?: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type DataIndex = keyof DataType;

const data: DataType[] = [
  {
    key: 'header-1',
    isGroupHeader: true,
    title: 'YESTERDAY',
  },
  {
    key: '1',
    title: 'Agreement Blueprints',
    author: 'Rebecca Tavarez',
    status: 'in Drafts',
    recipients: ['user1', 'user2', 'user3'],
    updated: 'May 15, 2024',
  },
  {
    key: '2',
    title: 'Legal Document Sample',
    author: 'Rebecca Tavarez',
    status: 'Completed',
    recipients: ['user1', 'user2'],
    updated: 'May 15, 2024',
  },
  {
    key: '3',
    title: 'Agreement Prototypes',
    author: 'Rebecca Tavarez',
    status: 'Need Actions',
    recipients: ['user1', 'user2'],
    updated: 'May 15, 2024',
  },
];

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { data: session } = useSession();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  interface SubmitValues {
    tutor: string; 
    file?: {
      fileList?: { originFileObj: File }[];
    };
  }
  
  const handleSubmit = (values: SubmitValues) => {
    const senderId = session?.user?.id;
    const tutorId: string = values.tutor;
    const uploadedFile: File | undefined = values.file?.fileList?.[0]?.originFileObj;
  
    console.log("Sender ID:", senderId);
    console.log("Tutor ID:", tutorId);
    console.log("Uploaded File:", uploadedFile);
  
    message.success('Document submitted successfully!');
    setIsModalOpen(false);
    form.resetFields();
  };
  
  const uploadProps = {
    beforeUpload: (_file: File) => {
      void _file; 
      return true;
    },
  };
  
  

  const columns: ColumnsType<DataType> = [
    {
      title: <Text strong style={{ fontSize: '14px' }}>Title</Text>,
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: DataType) =>
        record.isGroupHeader ? (
          <Text strong style={{ fontSize: '14px', color: '#1677ff' }}>{text}</Text>
        ) : (
          <div>
            <Text strong>{text}</Text>
            <div style={{ fontSize: '12px', color: '#888' }}>by {record.author}</div>
          </div>
        ),
      onCell: (record: DataType) =>
        record.isGroupHeader
          ? { colSpan: 5, style: { backgroundColor: '#e6f7ff', fontWeight: 'bold', textAlign: 'left', borderBottom: 'none', borderTop: 'none' } }
          : { style: { borderBottom: 'none', borderTop: 'none' } },
    },
    {
      title: <Text strong style={{ fontSize: '14px' }}>Status</Text>,
      dataIndex: 'status',
      key: 'status',
      render: (status?: string) =>
        status ? <Badge color={status === 'Completed' ? 'green' : status === 'Need Actions' ? 'orange' : 'gray'} text={status} /> : null,
      onCell: (record: DataType) => (record.isGroupHeader ? { colSpan: 0 } : { style: { borderBottom: 'none', borderTop: 'none' } }),
    },
    {
      title: <Text strong style={{ fontSize: '14px' }}>Recipients</Text>,
      dataIndex: 'recipients',
      key: 'recipients',
      render: (recipients?: string[]) =>
        recipients ? (
          <Avatar.Group>
            {recipients.map((user, index) => (
              <Avatar key={index} src={`https://i.pravatar.cc/40?u=${user}`} />
            ))}
          </Avatar.Group>
        ) : null,
      onCell: (record: DataType) => (record.isGroupHeader ? { colSpan: 0 } : { style: { borderBottom: 'none', borderTop: 'none' } }),
    },
    {
      title: <Text strong style={{ fontSize: '14px' }}>Status Updated</Text>,
      dataIndex: 'updated',
      key: 'updated',
      onCell: (record: DataType) => (record.isGroupHeader ? { colSpan: 0 } : { style: { borderBottom: 'none', borderTop: 'none' } }),
    },
    {
      title: <Text strong style={{ fontSize: '14px' }}>Action</Text>,
      key: 'action',
      render: (text: string, record: DataType) =>
        !record.isGroupHeader ? (
          <Link href={{ pathname: '/students/upload-document-detail/detail', query: { id: record.key } }}>
            <Button type="primary" ghost>Detail</Button>
          </Link>
        ) : null,
      onCell: (record: DataType) => (record.isGroupHeader ? { colSpan: 0 } : { style: { borderBottom: 'none', borderTop: 'none' } }),
    },
  ];

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <Title level={2}>Submit Assignments and Documents</Title>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <Button type="primary" onClick={showModal}>Add Document</Button>
      </div>
      <Table<DataType> columns={columns} dataSource={data} pagination={false} bordered={false} showHeader />
      <Modal title="Add Document" open={isModalOpen} onCancel={handleCancel} footer={null}>
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Title is required!' }]}> 
            <Input placeholder="Enter document title" />
          </Form.Item>
          <Form.Item label="Select Tutor" name="tutor" rules={[{ required: true, message: 'Tutor selection is required!' }]}> 
            <Select placeholder="Choose tutor">
              <Option value="tutor1">Tutor 1</Option>
              <Option value="tutor2">Tutor 2</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Upload File" name="file" rules={[{ required: true, message: 'File upload is required!' }]}> 
            <Dragger {...uploadProps}> 
              <UploadOutlined /> Click or drag file to this area to upload
            </Dragger>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit">Submit</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default App;
