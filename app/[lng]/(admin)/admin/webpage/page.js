"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingDiv from '@/components/Loading/Text/Index';
import AdminLayout from '@/components/admin/layouts/AdminLayout';
import { Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@/components/admin/Editor/editor'), {
    ssr: false,
    loading: () => <p>Уншиж байна...</p>
});

const { Option } = Select;

export default function WebpageAdmin({ params: { lng } }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const [body, setBody] = useState('');
    const [user, setUser] = useState(null);

    const fetchWebpages = async () => {
        try {
            const response = await axios.get('/api/webpage/all');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching webpages:', error);
            message.error('Failed to fetch webpage data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/auth/user');
                const data = await response.json();
                if (data.status) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        
        fetchUser();
        fetchWebpages();
    }, []);

    const handleCreate = () => {
        setEditingId(null);
        setBody('');
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingId(record.id);
        setBody(record.body);
        form.setFieldsValue({
            name: record.name,
            slug: record.slug,
            language: record.language,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/webpage/${id}`);
            message.success('Webpage deleted successfully');
            fetchWebpages();
        } catch (error) {
            console.error('Error deleting webpage:', error);
            message.error('Failed to delete webpage');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const currentDate = new Date().toISOString();
            const dataToSubmit = {
                ...values,
                body: body,
                created_by: user?.username || 'anonymousUser',
                created_date: currentDate,
                last_modified_date: currentDate,
                published_date: currentDate,
            };

            if (editingId) {
                await axios.put(`/api/webpage/${editingId}`, dataToSubmit);
                message.success('Webpage updated successfully');
            } else {
                await axios.post('/api/webpage', dataToSubmit);
                message.success('Webpage created successfully');
            }
            setIsModalVisible(false);
            fetchWebpages();
        } catch (error) {
            console.error('Error saving webpage:', error);
            message.error('Failed to save webpage');
        }
    };

    const columns = [
        {
            title: 'Гарчиг',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Товчлол',
            dataIndex: 'slug',
            key: 'slug',
        },
        {
            title: 'Хэл',
            dataIndex: 'language',
            key: 'language',
        },
        {
            title: 'Үйлдэл',
            key: 'actions',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <AdminLayout lng={lng}>
            <div className="p-6">
                <div className="flex justify-between mb-4">
                    <h1 className="text-2xl font-bold">Хуудасын бүртгэл</h1>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        Хуудас үүсгэх
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-4">
                        <LoadingDiv />
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                )}

                <Modal
                    title={editingId ? "Edit Webpage" : "Create Webpage"}
                    open={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                    width={800}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            name="name"
                            label="Гарчиг"
                            rules={[{ required: true, message: 'Please input the name!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="slug"
                            label="Товчлол"
                            rules={[{ required: true, message: 'Please input the slug!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="language"
                            label="Хэл сонгох"
                            rules={[{ required: true, message: 'Please select the language!' }]}
                        >
                            <Select>
                                <Option value="MN">Mongolian</Option>
                                <Option value="EN">English</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Content"
                            rules={[{ required: true, message: 'Please input the content!' }]}
                        >
                            <Editor setBody={setBody} />
                        </Form.Item>

                        <Form.Item>
                            <div className="flex justify-end gap-2">
                                <Button onClick={() => setIsModalVisible(false)}>
                                    Болих
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    {editingId ? 'Засах' : 'Хадгалах'}
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </AdminLayout>
    );
}
