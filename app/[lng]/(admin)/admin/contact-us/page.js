"use client"
import React, { useState, useEffect } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, message, Space, Card, Row, Col, Typography } from 'antd';
import dynamic from 'next/dynamic';

const { TextArea } = Input;
const { Title } = Typography;

const Editor = dynamic(() => import('@/components/admin/Editor/editor'), {
    ssr: false,
    loading: () => <p>Уншиж байна...</p>
});

export default function ContactUsAdmin() {
    const [form] = Form.useForm();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [bodyMn, setBodyMn] = useState('');
    const [bodyEn, setBodyEn] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const indexBodyTemplate = (rowData, props) => {
        return props.rowIndex + 1;
    };

    const fetchData = async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/contactus?page=${page - 1}&pageSize=${pageSize}`, {
                cache: 'no-store'
            });
            const result = await response.json();
            
            if (result.error) {
                message.error(result.error);
                return;
            }

            const contactList = Array.isArray(result.data) ? result.data : [];
            setData(contactList);
    
            setPagination(prev => ({
                ...prev,
                total: result.pagination?.total || contactList.length,
                current: page,
                pageSize: pageSize
            }));            
    
        } catch (error) {
            console.error('Error fetching contact-us:', error);
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

    const handleAdd = () => {
        setEditingId(null);
        setSelectedItem(null);
        setBodyMn('');
        setBodyEn('');
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (rowData) => {
        setEditingId(rowData.id);
        setSelectedItem(rowData);
        setBodyMn(rowData.bodyMn || '');
        setBodyEn(rowData.bodyEn || '');
        form.setFieldsValue({
            titleMn: rowData.titleMn,
            titleEn: rowData.titleEn
        });
        setModalVisible(true);
    };

    const handleView = (rowData) => {
        setSelectedItem(rowData);
        setViewModalVisible(true);
    };

    const handleDelete = (id) => {
        confirmDialog({
            message: 'Энэ бичлэгийг устгахдаа итгэлтэй байна уу?',
            header: 'Устгах',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteRecord(id),
            reject: () => {}
        });
    };

    const deleteRecord = async (id) => {
        try {
            const response = await fetch(`/api/contactus?id=${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            
            if (result.error) {
                message.error(result.error);
            } else {
                message.success('Амжилттай устгалаа');
                fetchData(pagination.current, pagination.pageSize);
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            message.error('Устгахад алдаа гарлаа');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const url = '/api/contactus';
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { 
                ...values, 
                bodyMn: bodyMn,
                bodyEn: bodyEn,
                id: editingId 
            } : {
                ...values,
                bodyMn: bodyMn,
                bodyEn: bodyEn
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const result = await response.json();
            
            if (result.error) {
                message.error(result.error);
            } else {
                message.success(editingId ? 'Амжилттай шинэчиллээ' : 'Амжилттай нэмлээ');
                setModalVisible(false);
                fetchData(pagination.current, pagination.pageSize);
            }
        } catch (error) {
            console.error('Error saving record:', error);
            message.error('Хадгалахад алдаа гарлаа');
        }
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <Space>
                <Button 
                    type="primary" 
                    icon={<EyeOutlined />} 
                    size="small"
                    onClick={() => handleView(rowData)}
                >
                    Харах
                </Button>
                <Button 
                    type="default" 
                    icon={<EditOutlined />} 
                    size="small"
                    onClick={() => handleEdit(rowData)}
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
            </Space>
        );
    };

    const titleMnBodyTemplate = (rowData) => {
        return (
            <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {rowData.titleMn}
            </div>
        );
    };

    const titleEnBodyTemplate = (rowData) => {
        return (
            <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {rowData.titleEn}
            </div>
        );
    };

    const bodyMnBodyTemplate = (rowData) => {
        const content = rowData.bodyMn || '';
        const plainText = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
        return (
            <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {plainText || 'Агуулга байхгүй'}
            </div>
        );
    };

    const bodyEnBodyTemplate = (rowData) => {
        const content = rowData.bodyEn || '';
        const plainText = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
        return (
            <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {plainText || 'No content'}
            </div>
        );
    };

    return (
        <div className="p-4">
            <Card>
                <Row justify="space-between" align="middle" className="mb-4">
                    <Col>
                        <Title level={3}>Холбоо барих удирдлага</Title>
                    </Col>
                    <Col>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={handleAdd}
                        >
                            Нэмэх
                        </Button>
                    </Col>
                </Row>

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
                    <Column field="id" header="ID" style={{ width: '5%' }} />
                    <Column field="titleMn" header="Гарчиг (Монгол)" body={titleMnBodyTemplate} style={{ width: '20%' }} />
                    <Column field="titleEn" header="Гарчиг (Англи)" body={titleEnBodyTemplate} style={{ width: '20%' }} />
                    <Column field="bodyMn" header="Агуулга (Монгол)" body={bodyMnBodyTemplate} style={{ width: '25%' }} />
                    <Column field="bodyEn" header="Агуулга (Англи)" body={bodyEnBodyTemplate} style={{ width: '25%' }} />
                    <Column header="Үйлдэл" body={actionBodyTemplate} style={{ width: '15%' }} />
                </DataTable>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                title={editingId ? "Холбоо барих засах" : "Холбоо барих нэмэх"}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={1300}
                zIndex={1100}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="titleMn"
                                label="Гарчиг (Монгол)"
                                rules={[{ required: true, message: 'Монгол гарчиг оруулна уу!' }]}
                            >
                                <Input placeholder="Монгол гарчиг" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="titleEn"
                                label="Гарчиг (Англи)"
                                rules={[{ required: true, message: 'Англи гарчиг оруулна уу!' }]}
                            >
                                <Input placeholder="English title" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Агуулга (Монгол)"
                            >
                                <Editor 
                                    setBody={setBodyMn}
                                    defaultValue={bodyMn}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Агуулга (Англи)"
                            >
                                <Editor 
                                    setBody={setBodyEn}
                                    defaultValue={bodyEn}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item className="text-right">
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>
                                Цуцлах
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingId ? 'Шинэчлэх' : 'Нэмэх'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Modal */}
            <Modal
                title="Холбоо барих дэлгэрэнгүй"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Хаах
                    </Button>
                ]}
                width={1300}
                zIndex={1100}
            >
                {selectedItem && (
                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <h4>Монгол</h4>
                                <p><strong>Гарчиг:</strong> {selectedItem.titleMn}</p>
                                <p><strong>Агуулга:</strong></p>
                                <div style={{ 
                                    border: '1px solid #d9d9d9', 
                                    padding: '8px', 
                                    borderRadius: '6px',
                                    minHeight: '100px',
                                    maxHeight: '200px',
                                    overflow: 'auto'
                                }}
                                dangerouslySetInnerHTML={{ __html: selectedItem.bodyMn || 'Агуулга байхгүй' }}
                                />
                            </Col>
                            <Col span={12}>
                                <h4>English</h4>
                                <p><strong>Title:</strong> {selectedItem.titleEn}</p>
                                <p><strong>Content:</strong></p>
                                <div style={{ 
                                    border: '1px solid #d9d9d9', 
                                    padding: '8px', 
                                    borderRadius: '6px',
                                    minHeight: '100px',
                                    maxHeight: '200px',
                                    overflow: 'auto'
                                }}
                                dangerouslySetInnerHTML={{ __html: selectedItem.bodyEn || 'No content' }}
                                />
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>

            <ConfirmDialog />
        </div>
    );
}
