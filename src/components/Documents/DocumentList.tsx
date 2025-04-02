import React, { useState, useEffect } from 'react';
import { List, Card, Spin, Empty, message } from 'antd';
import { DocumentResponse } from '@/types/Documents';
import { useSession } from 'next-auth/react';

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
                const response = await fetch(
                    `http://localhost:5142/api/Documents/user-documents`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ studentId, meta: { pageNumber: 1, pageSize: 10 } }),
                    }
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch documents. Status: ${response.status}`);
                }

                const data = await response.json();
                setDocuments(data.data);
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
        return <Spin spinning />;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (documents.length === 0) {
        return <Empty description="No documents available" />;
    }

    return (
        <List
            dataSource={documents}
            renderItem={(document) => (
                <List.Item>
                    <Card title={document.title}>
                        <p>Recipient: {document.recipientName}</p>
                        <p>Uploaded At: {document.updatedAt}</p>
                        <p>Status: {document.status}</p>
                    </Card>
                </List.Item>
            )}
        />
    );
};

export default DocumentList;