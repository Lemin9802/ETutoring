import React, { useState, useEffect } from 'react';
import { List, Card, Spin, Empty, message, Typography, Badge, Space, Avatar } from 'antd';
import { FileTextOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { DocumentResponse } from '@/types/Documents';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import dayjs from 'dayjs';
import { convertDocumentStatusColor } from '@/utils/convertDocumentStatusColor';
import { convertDocumentStatusName } from '@/utils/convertDocumentStatusName';

interface DocumentListProps {
    studentId: string;
}

const DocumentList: React.FC<DocumentListProps> = ({ studentId }) => {
    const [documents, setDocuments] = useState<DocumentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const session = useSession();
    const token = session?.data?.user?.accessToken;

    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.post('/api/documents/user', {
                    page_number: 1,
                    page_size: 10,
                    studentId
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status !== 200) {
                    throw new Error(`Failed to fetch documents. Status: ${response.status}`);
                }

                setDocuments(response.data.data);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError('An unexpected error occurred.');
                }
                message.error('Failed to load documents');
            } finally {
                setLoading(false);
            }
        };

        if (studentId) {
            fetchDocuments();
        } else {
            setLoading(false);
            setDocuments([]);
        }
    }, [studentId, token]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <Spin size="large" tip="Loading documents..." />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', background: '#fff1f0', borderRadius: '8px' }}>
                <Typography.Text type="danger" style={{ fontSize: '16px' }}>
                    Error: {error}
                </Typography.Text>
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                    <Typography.Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
                        No documents available
                    </Typography.Text>
                }
                style={{ padding: '40px 0' }}
            />
        );
    }

    return (
        <List
            grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
            dataSource={documents}
            renderItem={(document) => {
                // Convert status string to number for color and name conversion
                const statusNumber = document.status === 'Reviewed' ? 1 : 0;
                const formattedDate = dayjs(document.updatedAt).format('MMMM D, YYYY h:mm A');

                return (
                    <List.Item>
                        <Card
                            hoverable
                            className="document-card"
                            style={{
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                                transition: 'all 0.3s'
                            }}
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Avatar
                                        icon={<FileTextOutlined />}
                                        style={{ backgroundColor: '#1890ff' }}
                                    />
                                    <Typography.Title level={5} style={{ margin: 0 }}>
                                        {document.title}
                                    </Typography.Title>
                                </div>
                            }
                            extra={
                                <Badge
                                    color={convertDocumentStatusColor(statusNumber)}
                                    text={
                                        <Typography.Text strong>
                                            {convertDocumentStatusName(statusNumber)}
                                        </Typography.Text>
                                    }
                                />
                            }
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <UserOutlined style={{ color: '#8c8c8c' }} />
                                    <Typography.Text>
                                        <Typography.Text type="secondary">Recipient: </Typography.Text>
                                        <Typography.Text strong>{document.recipientName}</Typography.Text>
                                    </Typography.Text>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                                    <Typography.Text>
                                        <Typography.Text type="secondary">Updated: </Typography.Text>
                                        <Typography.Text>{formattedDate}</Typography.Text>
                                    </Typography.Text>
                                </div>
                            </Space>
                        </Card>
                    </List.Item>
                );
            }}
            style={{ padding: '16px 0' }}
        />
    );
};

export default DocumentList;