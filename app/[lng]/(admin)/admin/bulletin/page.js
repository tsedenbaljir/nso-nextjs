"use client"
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { Form, message, Button, Modal, Input, DatePicker } from 'antd';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { CopyOutlined, PlusOutlined } from '@ant-design/icons';

export default function ContactAdmin({ params: { lng } }) {
    const { t } = useTranslation(lng);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
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
            console.log(result);

            const bulletinList = Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
            setData(bulletinList.map((item, index) => ({
                ...item,
                id: (page - 1) * pageSize + index + 1
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

    const handleSubmit = async (values) => {
        setSubmitLoading(true);
        try {
            const response = await fetch('/api/bulletin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: values.title,
                    letter: values.letter,
                    content_type: 'NSONEWS',
                    news_type: 'FUTURE',
                    created_date: values.created_date ? values.created_date.toISOString() : new Date().toISOString()
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
                <Column field="id" header="№" style={{ width: '3%' }} />
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
            </DataTable>

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
                        name="letter"
                        label="Захидал"
                        rules={[{ required: true, message: 'Захидал оруулна уу!' }]}
                    >
                        <Input.TextArea
                            rows={6}
                            placeholder="Захидал оруулна уу"
                        />
                    </Form.Item>

                    <Form.Item
                        name="created_date"
                        label="Огноо"
                    >
                        <DatePicker
                            style={{ width: '100%' }}
                            placeholder="Огноо сонгоно уу"
                        />
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
        </div>
    );
} 