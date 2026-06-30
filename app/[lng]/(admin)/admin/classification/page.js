"use client"
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { EditOutlined, DeleteOutlined, PlusOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Select, message } from 'antd';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';

const { TextArea } = Input;
const { Option } = Select;

export default function ClassificationAdmin(props0) {
    const { lng } = use(props0.params);
    const router = useRouter();

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const indexBodyTemplate = (rowData, options) => {
        return (pagination.current - 1) * pagination.pageSize + options.rowIndex + 1;
    };

    const fetchData = async (page = 1, pageSize = 10, search = '') => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/methodology/classification/admin?page=${page - 1}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`,
                { cache: 'no-store' }
            );
            const result = await response.json();
            if (result.status) {
                setData(result.data || []);
                setPagination({
                    current: page,
                    pageSize,
                    total: result.pagination?.total || 0,
                });
            } else {
                message.error(result.message || 'Алдаа гарлаа');
            }
        } catch (error) {
            console.error('Error fetching classification:', error);
            message.error('Алдаа гарлаа');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onPage = (event) => {
        fetchData(event.page + 1, event.rows, searchValue);
    };

    const handleSearch = () => {
        fetchData(1, pagination.pageSize, searchValue);
    };

    const handleDelete = (id) => {
        confirmDialog({
            message: 'Энэ ангиллыг устгахдаа итгэлтэй байна уу?',
            header: 'Устгах уу?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Тийм',
            rejectLabel: 'Үгүй',
            accept: async () => {
                try {
                    const response = await fetch(`/api/methodology/classification/admin?id=${id}`, {
                        method: 'DELETE',
                    });
                    const result = await response.json();
                    if (result.status) {
                        message.success('Амжилттай устгалаа');
                        fetchData(pagination.current, pagination.pageSize, searchValue);
                    } else {
                        message.error(result.message);
                    }
                } catch (error) {
                    console.error('Error deleting entry:', error);
                    message.error('Алдаа гарлаа');
                }
            },
        });
    };

    const handleEdit = async (record) => {
        setEditingId(record.id);
        try {
            const response = await fetch(`/api/methodology/classification/admin?id=${record.id}`, {
                cache: 'no-store',
            });
            const result = await response.json();
            if (result.status) {
                form.setFieldsValue({
                    namemn: result.data.namemn,
                    nameen: result.data.nameen,
                    descriptionmn: result.data.descriptionmn,
                    descriptionen: result.data.descriptionen,
                    code: result.data.code,
                    active: result.data.active ?? 1,
                });
                setModalVisible(true);
            }
        } catch (error) {
            console.error('Error fetching entry:', error);
            message.error('Алдаа гарлаа');
        }
    };

    const handleAdd = () => {
        setEditingId(null);
        form.resetFields();
        form.setFieldsValue({ active: 1 });
        setModalVisible(true);
    };

    const handleSubmit = async (values) => {
        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = {
                id: editingId || undefined,
                namemn: values.namemn,
                nameen: values.nameen,
                descriptionmn: values.descriptionmn || '',
                descriptionen: values.descriptionen || '',
                code: values.code || '',
                active: values.active ?? 1,
                created_by: 'admin',
                last_modified_by: 'admin',
            };

            const response = await fetch('/api/methodology/classification/admin', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                cache: 'no-store',
            });
            const result = await response.json();

            if (result.status) {
                message.success(editingId ? 'Амжилттай шинэчлэгдлээ' : 'Амжилттай нэмэгдлээ');
                setModalVisible(false);
                form.resetFields();
                fetchData(pagination.current, pagination.pageSize, searchValue);
            } else {
                message.error(result.message || 'Алдаа гарлаа');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            message.error('Алдаа гарлаа');
        }
    };

    const actionBodyTemplate = (rowData) => (
        <div className="flex gap-2">
            <Button
                icon={<UnorderedListOutlined />}
                onClick={() => router.push(`/${lng}/admin/classification/${rowData.id}`)}
                title="Дэлгэрэнгүй мэдээлэл"
            />
            <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(rowData)} />
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(rowData.id)} />
        </div>
    );

    const statusBodyTemplate = (rowData) => (
        <button
            className={`px-2 py-1 text-xs rounded-md text-white ${
                rowData.active ? 'bg-emerald-500' : 'bg-yellow-500'
            }`}
        >
            {rowData.active ? 'Идэвхтэй' : 'Идэвхгүй'}
        </button>
    );

    const dateBodyTemplate = (rowData) => {
        try {
            return rowData.last_modified_date
                ? new Date(rowData.last_modified_date).toISOString().split('T')[0]
                : '-';
        } catch {
            return '-';
        }
    };

    return (
        <div className="">
            <ConfirmDialog />
            <div className="flex justify-between items-center mb-4 pt-3 px-3">
                <h1 className="text-2xl font-bold">Ангилал, код</h1>
                <div className="flex gap-2">
                    <Input.Search
                        placeholder="Нэр, кодоор хайх..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onSearch={handleSearch}
                        style={{ width: 260 }}
                        allowClear
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Ангилал нэмэх
                    </Button>
                </div>
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
                <Column header="#" body={indexBodyTemplate} style={{ width: 50 }} />
                <Column field="code" header="Код" style={{ width: '10%' }} />
                <Column field="namemn" header="Нэр (МН)" style={{ width: '25%' }} />
                <Column field="nameen" header="Нэр (EN)" style={{ width: '25%' }} />
                <Column
                    field="last_modified_date"
                    header="Өөрчилсөн огноо"
                    body={dateBodyTemplate}
                    style={{ width: '12%' }}
                />
                <Column
                    field="active"
                    header="Төлөв"
                    body={statusBodyTemplate}
                    style={{ width: '8%' }}
                    className="text-center"
                />
                <Column body={actionBodyTemplate} header="Үйлдэл" style={{ width: '14%' }} />
            </DataTable>

            <Modal
                title={editingId ? 'Ангилал засварлах' : 'Ангилал нэмэх'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={800}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="code" label="Код">
                        <Input />
                    </Form.Item>

                    <Form.Item name="namemn" label="Нэр (Монгол)" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="nameen" label="Нэр (Англи)" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="descriptionmn" label="Тайлбар (Монгол)">
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item name="descriptionen" label="Тайлбар (Англи)">
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item name="active" label="Төлөв" initialValue={1}>
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
    );
}
