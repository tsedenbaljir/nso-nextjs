"use client"
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/client';
import AdminLayout from '@/components/admin/layouts/AdminLayout';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Select, message } from 'antd';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';

const { TextArea } = Input;
const { Option } = Select;

export default function GlossaryAdmin({ params: { lng } }) {
    const { t } = useTranslation(lng);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const indexBodyTemplate = (rowData, props) => {
        return props.rowIndex + 1;
    };

    // Fetch glossary data
    const fetchData = async (page = 1, pageSize = 10) => {
        try {
            const response = await fetch(`/api/glossary?page=${page - 1}&pageSize=${pageSize}&role=admin`);
            const result = await response.json();
            if (result.status) {
                setData(result.data);
                setPagination({
                    ...pagination,
                    total: result.pagination.total,
                    current: page,
                    pageSize: pageSize
                });
            }
        } catch (error) {
            console.error('Error fetching glossary:', error);
            message.error('Алдаа гарлаа');
        } finally {
            setLoading(false);
        }
    };

    // Fetch sectors for dropdown
    const fetchSectors = async () => {
        try {
            const response = await fetch('/api/glossary/sectors');
            const data = await response.json();
            setSectors(data);
        } catch (error) {
            console.error('Error fetching sectors:', error);
            message.error('Алдаа гарлаа');
        }
    };

    useEffect(() => {
        fetchData();
        fetchSectors();
    }, []);

    // Action buttons template
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(rowData)}
                />
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(rowData.id)}
                />
            </div>
        );
    };

    // Published status template
    const publishedBodyTemplate = (rowData) => {
        return (
            <button
                className={`px-2 py-1 text-xs rounded-md text-white ${
                    rowData.published
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : 'bg-yellow-500 hover:bg-yellow-600'
                }`}
            >
                {rowData.published ? 'Идэвхтэй' : 'Идэвхгүй'}
            </button>
        );
    };

    // Handle page change
    const onPage = (event) => {
        fetchData(event.page + 1, event.rows);
    };

    // Delete glossary entry
    const handleDelete = async (id) => {
        confirmDialog({
            message: 'Энэ бичлэгийг устгахдаа итгэлтэй байна уу?',
            header: 'Устгах уу?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Тийм',
            rejectLabel: 'Үгүй',
            accept: async () => {
                try {
                    const response = await fetch(`/api/glossary/admin?id=${id}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();
                    if (result.status) {
                        message.success('Амжилттай устгалаа');
                        fetchData(pagination.current, pagination.pageSize);
                    } else {
                        message.error(result.message);
                    }
                } catch (error) {
                    console.error('Error deleting entry:', error);
                    message.error('Алдаа гарлаа');
                }
            }
        });
    };

    // Edit glossary entry
    const handleEdit = async (record) => {
        setEditingId(record.id);
        try {
            const response = await fetch(`/api/glossary/admin?id=${record.id}`);
            const result = await response.json();
            if (result.status) {
                // Format the data before setting form values
                const formData = {
                    ...result.data,
                    sector_type: result.data.sector_type?.toString() // Convert to string if it's a number
                };
                form.setFieldsValue(formData);
                setModalVisible(true);
            }
        } catch (error) {
            console.error('Error fetching entry:', error);
            message.error('Алдаа гарлаа');
        }
    };

    // Submit form (create/update)
    const handleSubmit = async (values) => {
        try {
            const url = '/api/glossary/admin';
            const method = editingId ? 'PUT' : 'POST';
            
            // Format the data properly
            const body = {
                id: editingId || undefined,
                name: values.name,
                name_eng: values.name_eng,
                sector_type: values.sector_type,
                source: values.source || '',
                source_eng: values.source_eng || '',
                info: values.info,
                info_eng: values.info_eng,
                published: values.published || 1,
                last_modified_by: 'admin',
                created_by: 'admin'
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const result = await response.json();
            
            if (result.status) {
                message.success(editingId ? 'Амжилттай шинэчлэгдлээ' : 'Амжилттай нэмэгдлээ');
                setModalVisible(false);
                form.resetFields();
                fetchData(pagination.current, pagination.pageSize);
            } else {
                message.error(result.message || 'Алдаа гарлаа');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            message.error('Алдаа гарлаа');
        }
    };

    return (
        <AdminLayout lng={lng}>
            <div className="">
                <ConfirmDialog />
                <div className="flex justify-between mb-4 pt-3 px-3">
                    <h1 className="text-2xl font-bold">Нэр, томьёоны тайлбар</h1>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingId(null);
                            form.resetFields();
                            setModalVisible(true);
                        }}
                    >
                        Нэр, томьёоны тайлбар нэмэх
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
                    <Column
                        header="#"
                        body={indexBodyTemplate}
                        style={{ width: 20 }}
                    />
                    <Column field="name" header="Нэр" style={{ width: '40%' }} />
                    <Column field="sector_name_mn" header="Ангилал" style={{ width: '10%' }} />
                    <Column 
                        field="info" 
                        header="Томьёоны тайлбар" 
                        style={{ width: '25%' }}
                        body={(rowData) => (
                            <div className="truncate max-w-xs" title={rowData.info}>
                                {rowData.info}
                            </div>
                        )}
                    />
                    <Column 
                        field="published" 
                        header="Төлөв" 
                        style={{ width: '10%' }}
                        body={publishedBodyTemplate}
                        className="text-center"
                    />
                    <Column 
                        body={actionBodyTemplate}
                        header="Үйлдэл"
                        style={{ width: '10%' }}
                    />
                </DataTable>

                <Modal
                    title={editingId ? 'Засварлах' : 'Хадгалах'}
                    open={modalVisible}
                    onCancel={() => {
                        setModalVisible(false);
                        form.resetFields();
                    }}
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
                            label={'Нэр'}
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="name_eng"
                            label={'Англи нэр'}
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="sector_type"
                            label={'Ангилал'}
                            rules={[{ required: true }]}
                        >
                            <Select
                                placeholder="Ангилал сонгох"
                                allowClear
                            >
                                {sectors.map(sector => (
                                    <Option 
                                        key={sector.code} 
                                        value={sector.code.toString()} // Convert code to string
                                    >
                                        {lng === 'mn' ? sector.namemn : sector.nameen}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="source"
                            label={'Эх үүсвэр'}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="source_eng"
                            label={'Англи эх үүсвэр'}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="info"
                            label={'Томьёоны тайлбар'}
                            rules={[{ required: true }]}
                        >
                            <TextArea rows={4} />
                        </Form.Item>

                        <Form.Item
                            name="info_eng"
                            label={'Англи томьёоны тайлбар'}
                            rules={[{ required: true }]}
                        >
                            <TextArea rows={4} />
                        </Form.Item>

                        <Form.Item
                            name="published"
                            label={'Төлөв'}
                            valuePropName="checked"
                        >
                            <Select>
                                <Option value={1}>Идэвхтэй</Option>
                                <Option value={0}>Идэвхгүй</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item className="mb-0 text-right">
                            <Button onClick={() => setModalVisible(false)} className="mr-2">
                                Болих
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Хадгалах
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </AdminLayout>
    );
} 