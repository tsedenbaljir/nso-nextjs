"use client"
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { Form, message, Button, Modal, Input, DatePicker } from 'antd';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { CopyOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function ContactAdmin({ params: { lng } }) {
    const { t } = useTranslation(lng);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [editUploadedFile, setEditUploadedFile] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const fetchData = async (page = 1, pageSize = 10) => {
        try {
            const response = await fetch(`/api/bulletin?page=${page - 1}&pageSize=${pageSize}`, {
                cache: 'no-store'
            });
            const result = await response.json();

            const bulletinList = Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
            setData(bulletinList.map((item, index) => ({
                ...item,
                displayId: (page - 1) * pageSize + index + 1
            })));

            setPagination(prev => ({
                ...prev,
                total: result.pagination?.total || bulletinList.length,
                current: page,
                pageSize: pageSize
            }));

        } catch (error) {
            console.error('Error fetching bulletin:', error);
            message.error('Алдаа гарлаа');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onPage = (event) => {
        fetchData(event.page + 1, event.rows);
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setUploadedFile(null);
    };

    const showEditModal = (item) => {
        setEditingItem(item);
        editForm.setFieldsValue({
            title: item.name,
        });
        setIsEditModalVisible(true);
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        editForm.resetFields();
        setEditUploadedFile(null);
        setEditingItem(null);
    };

    const copyInputMessage = (body, slug) => {
        const url = `https://www.nso.mn/mn/download/${body}/${slug}`;

        // Create a temporary input element
        const tempInput = document.createElement('input');
        tempInput.value = url;
        document.body.appendChild(tempInput);

        // Select and copy the text
        tempInput.select();
        document.execCommand('copy');

        // Remove the temporary element
        document.body.removeChild(tempInput);

        // Show success message
        message.success('Амжилттай хуулагдлаа');
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('File upload failed');

            const data = await response.json();
            return data.filename;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    };

    const handleSubmit = async (values) => {
        setSubmitLoading(true);
        try {
            let fileUrl = null;
            
            if (uploadedFile) {
                try {
                    fileUrl = await uploadFile(uploadedFile);
                } catch (error) {
                    message.error('Файл хуулахад алдаа гарлаа!');
                    setSubmitLoading(false);
                    return;
                }
            }

            const response = await fetch('/api/bulletin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: values.title,
                    created_by: 'anonymousUser',
                    last_modified_by: 'anonymousUser',
                    body: Date.now().toString(),
                    content_type: 'NSONEWS',
                    news_type: 'FUTURE',
                    views: 0,
                    published: 1,
                    header_image: fileUrl,
                    slug: fileUrl,
                    published_date: new Date().toISOString(),
                    created_date: new Date().toISOString()
                }),
            });

            const result = await response.json();

            if (result.status) {
                message.success('Бюллетень амжилттай нэмэгдлээ');
                setIsModalVisible(false);
                form.resetFields();
                fetchData(pagination.current, pagination.pageSize);
            } else {
                message.error(result.message || 'Алдаа гарлаа');
            }
        } catch (error) {
            console.error('Error creating bulletin:', error);
            message.error('Алдаа гарлаа');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEditSubmit = async (values) => {
        setEditLoading(true);
        try {
            let fileUrl = editingItem.header_image; // Keep existing file if no new file uploaded
            
            if (editUploadedFile) {
                try {
                    fileUrl = await uploadFile(editUploadedFile);
                } catch (error) {
                    message.error('Файл хуулахад алдаа гарлаа!');
                    setEditLoading(false);
                    return;
                }
            }

            const response = await fetch('/api/bulletin', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editingItem.id,
                    name: values.title,
                    last_modified_by: 'anonymousUser',
                    header_image: fileUrl
                }),
            });

            const result = await response.json();

            if (result.status) {
                message.success('Бюллетень амжилттай шинэчлэгдлээ');
                setIsEditModalVisible(false);
                editForm.resetFields();
                setEditUploadedFile(null);
                setEditingItem(null);
                fetchData(pagination.current, pagination.pageSize);
            } else {
                message.error(result.message || 'Алдаа гарлаа');
            }
        } catch (error) {
            console.error('Error updating bulletin:', error);
            message.error('Алдаа гарлаа');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Бюллетень устгах',
            content: 'Та энэ бюллетенийг устгахдаа итгэлтэй байна уу?',
            okText: 'Тийм',
            cancelText: 'Үгүй',
            onOk: async () => {
                try {
                    const response = await fetch(`/api/bulletin?id=${id}`, {
                        method: 'DELETE',
                    });

                    const result = await response.json();

                    if (result.status) {
                        message.success('Бюллетень амжилттай устгагдлаа');
                        fetchData(pagination.current, pagination.pageSize);
                    } else {
                        message.error(result.message || 'Алдаа гарлаа');
                    }
                } catch (error) {
                    console.error('Error deleting bulletin:', error);
                    message.error('Алдаа гарлаа');
                }
            },
        });
    };

    return (
        <div className="">
            <div className="mb-4 flex justify-between items-center pt-3">
                <h2 className="text-xl font-semibold ml-5">Бюллетень удирдлага</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showModal}
                    className='mr-3'
                >
                    Шинэ бюллетень нэмэх
                </Button>
            </div>

            <DataTable
                value={data}
                lazy
                paginator
                first={(pagination.current - 1) * pagination.pageSize}
                rows={pagination.pageSize}
                totalRecords={pagination.total}
                onPage={onPage}
                loading={loading}
                className="p-datatable-sm"
                emptyMessage="Мэдээлэл олдсонгүй"
            >
                <Column field="displayId" header="№" style={{ width: '3%' }} />
                <Column field="name" header="Гарчиг" style={{ width: '20%' }} />
                <Column field="body" header="Холбоос" style={{ width: '40%' }}
                    body={(rowData) => (
                        <div className="flex items-center w-[50%]">
                            <Input
                                readOnly
                                className='bg-gray-200'
                                value={`https://www.nso.mn/mn/download/${rowData.body}/${rowData.slug}`}
                                style={{ border: 'none', backgroundColor: 'transparent' }}
                            />
                            <Button
                                size="small"
                                type="primary"
                                icon={<CopyOutlined />}
                                className='text-white py-3 -ml-1 rounded-lg'
                                onClick={() => copyInputMessage(rowData.body, rowData.slug)}
                            >
                                Хуулах
                            </Button>
                        </div>
                    )}
                />
                <Column field="created_date" header="Огноо" body={(rowData) => new Date(rowData.created_date).toLocaleDateString()} style={{ width: '8%' }} />
                <Column 
                    header="Үйлдэл" 
                    style={{ width: '15%' }}
                    body={(rowData) => (
                        <div className="flex gap-2">
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => showEditModal(rowData)}
                            >
                                Засах
                            </Button>
                            <Button
                                type="primary"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                onClick={() => handleDelete(rowData.id)}
                            >
                                Устгах
                            </Button>
                        </div>
                    )}
                />
            </DataTable>

            {/* Add Modal */}
            <Modal
                title="Шинэ бюллетень нэмэх"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="title"
                        label="Гарчиг"
                        rules={[{ required: true, message: 'Гарчиг оруулна уу!' }]}
                    >
                        <Input placeholder="Гарчиг оруулна уу" />
                    </Form.Item>

                    <Form.Item
                        label="Файл"
                    >
                        <input
                            type="file"
                            onChange={(e) => setUploadedFile(e.target.files[0])}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        {uploadedFile && (
                            <div className="mt-2 text-sm text-green-600">
                                Файл сонгогдлоо: {uploadedFile.name}
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <div className="flex justify-end gap-2">
                            <Button onClick={handleCancel}>
                                Цуцлах
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitLoading}
                            >
                                Хадгалах
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title="Бюллетень засах"
                open={isEditModalVisible}
                onCancel={handleEditCancel}
                footer={null}
                width={600}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                >
                    <Form.Item
                        name="title"
                        label="Гарчиг"
                        rules={[{ required: true, message: 'Гарчиг оруулна уу!' }]}
                    >
                        <Input placeholder="Гарчиг оруулна уу" />
                    </Form.Item>

                    <Form.Item
                        label="Файл"
                    >
                        {editingItem?.header_image && (
                            <div className="mb-2 text-sm text-blue-600">
                                Одоогийн файл: {editingItem.header_image}
                            </div>
                        )}
                        <input
                            type="file"
                            onChange={(e) => setEditUploadedFile(e.target.files[0])}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        {editUploadedFile && (
                            <div className="mt-2 text-sm text-green-600">
                                Шинэ файл сонгогдлоо: {editUploadedFile.name}
                            </div>
                        )}
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <div className="flex justify-end gap-2">
                            <Button onClick={handleEditCancel}>
                                Цуцлах
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={editLoading}
                            >
                                Хадгалах
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
} 