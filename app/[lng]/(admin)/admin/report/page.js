"use client"
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { Form, message, Button, Modal, Input, Select, DatePicker, Space, Card, Statistic, Row, Col } from 'antd';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    DownloadOutlined,
    EyeOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined
} from '@ant-design/icons';

const { Option } = Select;

export default function ReportAdmin({ params: { lng } }) {
    const { t } = useTranslation(lng);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [editUploadedFile, setEditUploadedFile] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [viewingItem, setViewingItem] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [filters, setFilters] = useState({
        language: '',
        type: '',
        info: '',
        published: ''
    });
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        unpublished: 0,
        types: {}
    });

    const fileTypes = [
        { value: 'bulletin', label: 'Bulletin' },
        { value: 'report', label: 'Report' },
        { value: 'statistics', label: 'Statistics' },
        { value: 'publication', label: 'Publication' },
        { value: 'other', label: 'Other' }
    ];

    const languages = [
        { value: 'MN', label: 'Монгол' },
        { value: 'EN', label: 'English' }
    ];

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch all data using the admin API - no pagination limit
            const response = await fetch(`http://localhost:3000/api/download/admin?fetchAll=true&info=all`, {
                cache: 'no-store'
            });
            const result = await response.json();

            if (result.status && result.data) {
                const allData = Array.isArray(result.data) ? result.data : [result.data];
                
                const dataWithIds = allData.map((item, index) => ({
                    ...item,
                    displayId: index + 1
                }));

                setData(dataWithIds);
                setFilteredData(dataWithIds);
                setPagination(prev => ({
                    ...prev,
                    current: 1,
                    total: allData.length
                }));

                // Calculate statistics
                const stats = {
                    total: allData.length,
                    published: allData.filter(item => {
                        return item.published === 1 || item.published === '1' || item.published === true;
                    }).length,
                    unpublished: allData.filter(item => {
                        return item.published === 0 || item.published === '0' || item.published === false;
                    }).length,
                    types: allData.reduce((acc, item) => {
                        acc[item.file_type] = (acc[item.file_type] || 0) + 1;
                        return acc;
                    }, {})
                };
                setStats(stats);
            } else {
                message.error(result.message || 'Өгөгдөл татахад алдаа гарлаа');
            }

        } catch (error) {
            console.error('Error fetching download data:', error);
            message.error('Өгөгдөл татахад алдаа гарлаа');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onPage = (event) => {
        setPagination(prev => ({
            ...prev,
            current: event.page + 1,
            pageSize: event.rows
        }));
    };



    const handleFilter = () => {
        let filtered = [...data];

        if (filters.language) {
            filtered = filtered.filter(item => item.language === filters.language);
        }
        if (filters.type) {
            filtered = filtered.filter(item => item.file_type === filters.type);
        }
        if (filters.info) {
            filtered = filtered.filter(item =>
                item.name?.toLowerCase().includes(filters.info.toLowerCase()) ||
                item.info?.toLowerCase().includes(filters.info.toLowerCase())
            );
        }
        if (filters.published !== '') {
            filtered = filtered.filter(item => {
                const itemPublished = item.published === 1 || item.published === '1' || item.published === true;
                const filterPublished = parseInt(filters.published) === 1;
                return itemPublished === filterPublished;
            });
        }

        setFilteredData(filtered);
        setPagination(prev => ({
            ...prev,
            current: 1,
            total: filtered.length
        }));

        // Update statistics based on filtered data
        const stats = {
            total: filtered.length,
            published: filtered.filter(item => item.published === 1 || item.published === '1' || item.published === true).length,
            unpublished: filtered.filter(item => item.published === 0 || item.published === '0' || item.published === false).length,
            types: filtered.reduce((acc, item) => {
                acc[item.file_type] = (acc[item.file_type] || 0) + 1;
                return acc;
            }, {})
        };
        setStats(stats);
    };

    const clearFilters = () => {
        setFilters({
            language: '',
            type: '',
            info: '',
            published: ''
        });
        setFilteredData(data);
        setPagination(prev => ({
            ...prev,
            current: 1,
            total: data.length
        }));

        // Reset statistics to original data
        const stats = {
            total: data.length,
            published: data.filter(item => item.published === 1 || item.published === '1' || item.published === true).length,
            unpublished: data.filter(item => item.published === 0 || item.published === '0' || item.published === false).length,
            types: data.reduce((acc, item) => {
                acc[item.file_type] = (acc[item.file_type] || 0) + 1;
                return acc;
            }, {})
        };
        setStats(stats);
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
            name: item.name,
            language: item.language,
            file_type: item.file_type,
            info: item.info,
            published: item.published
        });
        setIsEditModalVisible(true);
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        editForm.resetFields();
        setEditUploadedFile(null);
        setEditingItem(null);
    };

    const showViewModal = (item) => {
        setViewingItem(item);
        setIsViewModalVisible(true);
    };

    const handleViewCancel = () => {
        setIsViewModalVisible(false);
        setViewingItem(null);
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

            const response = await fetch('/api/download/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: values.name,
                    language: values.language,
                    file_type: values.file_type,
                    info: values.info,
                    file_url: fileUrl,
                    published: values.published,
                    created_by: 'admin',
                    last_modified_by: 'admin'
                }),
            });

            const result = await response.json();

            if (result.status) {
                message.success(result.message || 'Татаж авах файл амжилттай нэмэгдлээ');
                setIsModalVisible(false);
                form.resetFields();
                setUploadedFile(null);
                fetchData();
            } else {
                message.error(result.message || 'Алдаа гарлаа');
            }
        } catch (error) {
            console.error('Error creating download item:', error);
            message.error('Алдаа гарлаа');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEditSubmit = async (values) => {
        setEditLoading(true);
        try {
            let fileUrl = editingItem.file_url;

            if (editUploadedFile) {
                try {
                    fileUrl = await uploadFile(editUploadedFile);
                } catch (error) {
                    message.error('Файл хуулахад алдаа гарлаа!');
                    setEditLoading(false);
                    return;
                }
            }

            const response = await fetch('/api/download/admin', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editingItem.id,
                    name: values.name,
                    language: values.language,
                    file_type: values.file_type,
                    info: values.info,
                    file_url: fileUrl,
                    published: values.published,
                    last_modified_by: 'admin'
                }),
            });

            const result = await response.json();

            if (result.status) {
                message.success(result.message || 'Татаж авах файл амжилттай шинэчлэгдлээ');
                setIsEditModalVisible(false);
                editForm.resetFields();
                setEditUploadedFile(null);
                setEditingItem(null);
                fetchData();
            } else {
                message.error(result.message || 'Алдаа гарлаа');
            }
        } catch (error) {
            console.error('Error updating download item:', error);
            message.error('Алдаа гарлаа');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Татаж авах файл устгах',
            content: 'Та энэ файлыг устгахдаа итгэлтэй байна уу?',
            okText: 'Тийм',
            cancelText: 'Үгүй',
            onOk: async () => {
                try {
                    const response = await fetch(`/api/download/admin?id=${id}`, {
                        method: 'DELETE',
                    });

                    const result = await response.json();

                    if (result.status) {
                        message.success(result.message || 'Татаж авах файл амжилттай устгагдлаа');
                        fetchData();
                    } else {
                        message.error(result.message || 'Алдаа гарлаа');
                    }
                } catch (error) {
                    console.error('Error deleting download item:', error);
                    message.error('Алдаа гарлаа');
                }
            },
        });
    };

    const downloadFile = (fileInfo, fileName) => {
        try {
            let fileUrl = '';
            if (typeof fileInfo === 'string') {
                const parsedInfo = JSON.parse(fileInfo);
                fileUrl = parsedInfo.pathName || parsedInfo.originalName || fileInfo;
            } else {
                fileUrl = fileInfo;
            }

            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
            message.error('Файл татахад алдаа гарлаа');
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Татаж авах файлын удирдлага</h1>
                <p className="text-gray-600">Бүх татаж авах файлуудыг харах, засах, устгах</p>
            </div>

            {/* Statistics Cards */}
            <Row gutter={16} className="mb-6">
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Нийт файл"
                            value={stats.total}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Нийтлэгдсэн"
                            value={stats.published}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Нийтлэгдээгүй"
                            value={stats.unpublished}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Файлын төрөл"
                            value={Object.keys(stats.types).length}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Хэл</label>
                        <Select
                            value={filters.language}
                            onChange={(value) => setFilters(prev => ({ ...prev, language: value }))}
                            style={{ width: 120 }}
                            placeholder="Бүгд"
                            allowClear
                        >
                            {languages.map(lang => (
                                <Option key={lang.value} value={lang.value}>{lang.label}</Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Файлын төрөл</label>
                        <Select
                            value={filters.type}
                            onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                            style={{ width: 120 }}
                            placeholder="Бүгд"
                            allowClear
                        >
                            {fileTypes.map(type => (
                                <Option key={type.value} value={type.value}>{type.label}</Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Хайх</label>
                        <Input
                            value={filters.info}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, info: e.target.value }));
                                // Apply filter immediately for search
                                let filtered = [...data];
                                if (e.target.value) {
                                    filtered = filtered.filter(item =>
                                        item.name?.toLowerCase().includes(e.target.value.toLowerCase()) ||
                                        item.info?.toLowerCase().includes(e.target.value.toLowerCase())
                                    );
                                }
                                if (filters.language) {
                                    filtered = filtered.filter(item => item.language === filters.language);
                                }
                                if (filters.type) {
                                    filtered = filtered.filter(item => item.file_type === filters.type);
                                }
                                if (filters.published !== '') {
                                    filtered = filtered.filter(item => {
                                        const itemPublished = item.published === 1 || item.published === '1' || item.published === true;
                                        const filterPublished = parseInt(filters.published) === 1;
                                        return itemPublished === filterPublished;
                                    });
                                }
                                
                                setFilteredData(filtered);
                                setPagination(prev => ({
                                    ...prev,
                                    current: 1,
                                    total: filtered.length
                                }));

                                // Update statistics
                                const stats = {
                                    total: filtered.length,
                                    published: filtered.filter(item => item.published === 1 || item.published === '1' || item.published === true).length,
                                    unpublished: filtered.filter(item => item.published === 0 || item.published === '0' || item.published === false).length,
                                    types: filtered.reduce((acc, item) => {
                                        acc[item.file_type] = (acc[item.file_type] || 0) + 1;
                                        return acc;
                                    }, {})
                                };
                                setStats(stats);
                            }}
                            placeholder="Нэр эсвэл мэдээлэл"
                            style={{ width: 200 }}
                            prefix={<SearchOutlined />}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Төлөв</label>
                        <Select
                            value={filters.published}
                            onChange={(value) => setFilters(prev => ({ ...prev, published: value }))}
                            style={{ width: 120 }}
                            placeholder="Бүгд"
                            allowClear
                        >
                            <Option value={1}>Нийтлэгдсэн</Option>
                            <Option value={0}>Нийтлэгдээгүй</Option>
                        </Select>
                    </div>
                    <Space>
                        <Button
                            type="primary"
                            icon={<FilterOutlined />}
                            onClick={handleFilter}
                        >
                            Шүүх
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={clearFilters}
                        >
                            Цэвэрлэх
                        </Button>
                    </Space>
                </div>
            </Card>

            {/* Actions */}
            <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    Нийт: {filteredData.length} файл
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showModal}
                >
                    Шинэ файл нэмэх
                </Button>
            </div>

            {/* Data Table */}
            <DataTable
                value={filteredData}
                paginator
                first={(pagination.current - 1) * pagination.pageSize}
                rows={pagination.pageSize}
                totalRecords={pagination.total}
                onPage={onPage}
                loading={loading}
                className="p-datatable-sm"
                emptyMessage="Мэдээлэл олдсонгүй"
                scrollable
                scrollHeight="600px"
                lazy={false}
            >
                <Column field="displayId" header="№" style={{ width: '3%' }}
                    body={(rowData, options) => {
                        const index = filteredData.findIndex(item => item.id === rowData.id);
                        return index + 1;
                    }}
                />
                <Column field="name" header="Нэр" style={{ width: '20%' }} />
                <Column field="file_type" header="Төрөл" style={{ width: '8%' }} />
                <Column field="language" header="Хэл" style={{ width: '5%' }}
                    body={(rowData) => (
                        <span className={`px-2 py-1 rounded text-xs ${rowData.language === 'MN' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {rowData.language === 'MN' ? 'МН' : 'EN'}
                        </span>
                    )}
                />
                <Column field="published" header="Төлөв" style={{ width: '8%' }}
                    body={(rowData) => {
                        const isPublished = rowData.published === 1 || rowData.published === '1' || rowData.published === true;
                        return (
                            <span className={`px-2 py-1 rounded text-xs ${isPublished ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {isPublished ? 'Нийтлэгдсэн' : 'Нийтлэгдээгүй'}
                            </span>
                        );
                    }}
                />
                <Column field="published_date" header="Огноо" style={{ width: '10%' }}
                    body={(rowData) => rowData.published_date ? new Date(rowData.published_date).toLocaleDateString() : '-'}
                />
                <Column
                    header="Үйлдэл"
                    style={{ width: '15%' }}
                    body={(rowData) => (
                        <div className="flex gap-1">
                            <Button
                                type="primary"
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => showViewModal(rowData)}
                                title="Харах"
                            />
                            <Button
                                type="primary"
                                size="small"
                                icon={<DownloadOutlined />}
                                onClick={() => downloadFile(rowData.file_info, rowData.name)}
                                title="Татах"
                            />
                            <Button
                                type="primary"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => showEditModal(rowData)}
                                title="Засах"
                            />
                            <Button
                                type="primary"
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(rowData.id)}
                                title="Устгах"
                            />
                        </div>
                    )}
                />
            </DataTable>

            {/* Add Modal */}
            <Modal
                title="Шинэ файл нэмэх"
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
                        name="name"
                        label="Файлын нэр"
                        rules={[{ required: true, message: 'Файлын нэр оруулна уу!' }]}
                    >
                        <Input placeholder="Файлын нэр оруулна уу" />
                    </Form.Item>

                    <Form.Item
                        name="language"
                        label="Хэл"
                        rules={[{ required: true, message: 'Хэл сонгоно уу!' }]}
                    >
                        <Select placeholder="Хэл сонгоно уу">
                            {languages.map(lang => (
                                <Option key={lang.value} value={lang.value}>{lang.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="file_type"
                        label="Файлын төрөл"
                        rules={[{ required: true, message: 'Файлын төрөл сонгоно уу!' }]}
                    >
                        <Select placeholder="Файлын төрөл сонгоно уу">
                            {fileTypes.map(type => (
                                <Option key={type.value} value={type.value}>{type.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="info"
                        label="Мэдээлэл"
                    >
                        <Input.TextArea placeholder="Нэмэлт мэдээлэл" rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="published"
                        label="Төлөв"
                        initialValue={1}
                    >
                        <Select>
                            <Option value={1}>Нийтлэгдсэн</Option>
                            <Option value={0}>Нийтлэгдээгүй</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Файл"
                    >
                        <input
                            type="file"
                            onChange={(e) => setUploadedFile(e.target.files[0])}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
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
                title="Файл засах"
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
                        name="name"
                        label="Файлын нэр"
                        rules={[{ required: true, message: 'Файлын нэр оруулна уу!' }]}
                    >
                        <Input placeholder="Файлын нэр оруулна уу" />
                    </Form.Item>

                    <Form.Item
                        name="language"
                        label="Хэл"
                        rules={[{ required: true, message: 'Хэл сонгоно уу!' }]}
                    >
                        <Select placeholder="Хэл сонгоно уу">
                            {languages.map(lang => (
                                <Option key={lang.value} value={lang.value}>{lang.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="file_type"
                        label="Файлын төрөл"
                        rules={[{ required: true, message: 'Файлын төрөл сонгоно уу!' }]}
                    >
                        <Select placeholder="Файлын төрөл сонгоно уу">
                            {fileTypes.map(type => (
                                <Option key={type.value} value={type.value}>{type.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="info"
                        label="Мэдээлэл"
                    >
                        <Input.TextArea placeholder="Нэмэлт мэдээлэл" rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="published"
                        label="Төлөв"
                    >
                        <Select>
                            <Option value={1}>Нийтлэгдсэн</Option>
                            <Option value={0}>Нийтлэгдээгүй</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Файл"
                    >
                        {editingItem?.file_info && (
                            <div className="mb-2 text-sm text-blue-600">
                                Одоогийн файл: {(() => {
                                    try {
                                        const parsed = JSON.parse(editingItem.file_info);
                                        return parsed.originalName || parsed.pathName || 'Unknown file';
                                    } catch {
                                        return editingItem.file_info;
                                    }
                                })()}
                            </div>
                        )}
                        <input
                            type="file"
                            onChange={(e) => setEditUploadedFile(e.target.files[0])}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
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

            {/* View Modal */}
            <Modal
                title="Файлын дэлгэрэнгүй"
                open={isViewModalVisible}
                onCancel={handleViewCancel}
                footer={[
                    <Button key="close" onClick={handleViewCancel}>
                        Хаах
                    </Button>,
                    <Button
                        key="download"
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => downloadFile(viewingItem?.file_info, viewingItem?.name)}
                    >
                        Татах
                    </Button>
                ]}
                width={600}
            >
                {viewingItem && (
                    <div className="space-y-4">
                        <div>
                            <label className="font-semibold">Файлын нэр:</label>
                            <p>{viewingItem.name}</p>
                        </div>
                        <div>
                            <label className="font-semibold">Файлын төрөл:</label>
                            <p>{viewingItem.file_type}</p>
                        </div>
                        <div>
                            <label className="font-semibold">Хэл:</label>
                            <p>{viewingItem.language === 'MN' ? 'Монгол' : 'English'}</p>
                        </div>
                        <div>
                            <label className="font-semibold">Төлөв:</label>
                            <p>{(viewingItem.published === 1 || viewingItem.published === '1' || viewingItem.published === true) ? 'Нийтлэгдсэн' : 'Нийтлэгдээгүй'}</p>
                        </div>
                        <div>
                            <label className="font-semibold">Нийтлэгдсэн огноо:</label>
                            <p>{viewingItem.published_date ? new Date(viewingItem.published_date).toLocaleString() : '-'}</p>
                        </div>
                        <div>
                            <label className="font-semibold">Мэдээлэл:</label>
                            <p>{viewingItem.info || '-'}</p>
                        </div>
                        <div>
                            <label className="font-semibold">Файлын мэдээлэл:</label>
                            <p className="break-all text-blue-600">
                                {viewingItem.file_info ?
                                    (() => {
                                        try {
                                            const parsed = JSON.parse(viewingItem.file_info);
                                            return `Нэр: ${parsed.originalName}, Хэмжээ: ${parsed.fileSize} bytes, Өргөтгөл: ${parsed.extension}`;
                                        } catch {
                                            return viewingItem.file_info;
                                        }
                                    })() : '-'
                                }
                            </p>
                        </div>
                        <div>
                            <label className="font-semibold">Харагдах тоо:</label>
                            <p>{viewingItem.views || 0}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

