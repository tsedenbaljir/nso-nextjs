"use client";
import { useEffect, useState } from "react";
import { Button, Input, Table, Space, Modal, Form, Upload, message, Card, Typography, Select, DatePicker } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { useTranslation } from "@/app/i18n/client";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function FileLibraryAdmin({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingFile, setEditingFile] = useState(null);
    const [form] = Form.useForm();

    // Fetch files from API
    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/file-library/admin?lng=${lng}&searchTerm=${searchTerm}`);
            if (response.ok) {
                const data = await response.json();
                console.log("API Response:", data);

                // Ensure data.data is always an array
                if (data.success && data.data) {
                    if (Array.isArray(data.data)) {
                        setFiles(data.data);
                    } else {
                        // If data.data is not an array, wrap it in an array
                        setFiles([data.data]);
                    }
                } else {
                    setFiles([]);
                }
            }
        } catch (error) {
            console.error("Error fetching files:", error);
            message.error("Failed to fetch files");
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [lng, searchTerm]);

    // Handle file operations
    const handleAdd = () => {
        setEditingFile(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingFile(record);
        form.setFieldsValue({
            title: record.title,
            description: record.description,
            type: record.type,
            category: record.category,
            tags: record.tags,
            isPublic: record.isPublic,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/file-library/admin?id=${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                message.success("File deleted successfully");
                fetchFiles();
            } else {
                message.error("Failed to delete file");
            }
        } catch (error) {
            console.error("Error deleting file:", error);
            message.error("Failed to delete file");
        }
    };

    const handleSubmit = async (values) => {
        try {
            const url = "/api/file-library/admin";
            const method = editingFile ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...values,
                    id: editingFile?.id,
                    lng,
                }),
            });

            if (response.ok) {
                message.success(editingFile ? "File updated successfully" : "File added successfully");
                setIsModalVisible(false);
                fetchFiles();
            } else {
                message.error("Failed to save file");
            }
        } catch (error) {
            console.error("Error saving file:", error);
            message.error("Failed to save file");
        }
    };

    const handleDownload = async (file) => {
        try {
            const response = await fetch(`/api/file-library/download/${file.id}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = file.originalName || file.title;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error("Error downloading file:", error);
            message.error("Failed to download file");
        }
    };

    // Table columns
    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            filters: [
                { text: "NSO Magazine", value: "nso-magazine" },
                { text: "Magazine", value: "magazine" },
                { text: "Census", value: "census" },
                { text: "Survey", value: "survey" },
                { text: "Infographic", value: "infographic" },
                { text: "Week Price", value: "weekprice" },
                { text: "Foreign Trade", value: "foreigntrade" },
                { text: "Presentation", value: "presentation" },
                { text: "Bulletin", value: "bulletin" },
                { text: "Annual", value: "annual" },
                { text: "Living Standard", value: "livingstandart" },
                { text: "Agricultural Census", value: "agricultural_census" },
                { text: "Enterprise Census", value: "enterprise_census" },
                { text: "Livestock Census", value: "livestock_census" },
                { text: "PAHC", value: "pahc" },
            ],
            onFilter: (value, record) => record.type === value,
        },
        {
            title: "File Info",
            dataIndex: "file_info",
            key: "file_info",
            render: (fileInfo) => {
                if (!fileInfo) return "-";
                try {
                    const info = JSON.parse(fileInfo);
                    return info.originalName || info.pathName || "File info available";
                } catch {
                    return "File info available";
                }
            },
        },
        {
            title: "File Size",
            dataIndex: "fileSize",
            key: "fileSize",
            render: (size) => {
                if (!size) return "-";
                const units = ["B", "KB", "MB", "GB"];
                let unitIndex = 0;
                let fileSize = size;
                while (fileSize >= 1024 && unitIndex < units.length - 1) {
                    fileSize /= 1024;
                    unitIndex++;
                }
                return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
            },
        },
        {
            title: "Downloads",
            dataIndex: "downloads",
            key: "downloads",
            sorter: (a, b) => a.downloads - b.downloads,
        },
        {
            title: "Public",
            dataIndex: "isPublic",
            key: "isPublic",
            render: (isPublic) => (
                <span style={{ color: isPublic ? "green" : "red" }}>
                    {isPublic ? "Yes" : "No"}
                </span>
            ),
        },
        {
            title: "Created",
            dataIndex: "createdDate",
            key: "createdDate",
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={() => handleDownload(record)}
                    >
                        Download
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleDelete(record.id)}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Тайлан эмхэтгэл</Title>
            </div>

            {/* Search and Add */}
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Input
                    placeholder="Файлын нэрээр хайх..."
                    prefix={<SearchOutlined />}
                    style={{ width: 300 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                />
                <Space>
                    <Button
                        onClick={() => {
                            const url = `/api/file-library/admin?lng=${lng}&searchTerm=${searchTerm}&limit=1000`;
                            window.open(url, '_blank');
                        }}
                    >
                        Бүгдийг харах
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        Шинээр нэмэх
                    </Button>
                </Space>
            </div>

            {/* Files Table */}
            <Table
                columns={columns}
                dataSource={files}
                loading={loading}
                rowKey="id"
                pagination={{
                    pageSize: 50,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['10', '25', '50', '100'],
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} файл`,
                }}
            />

            {/* Add/Edit Modal */}
            <Modal
                title={editingFile ? "Файл засах" : "Шинээр нэмэх"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
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
                        label="Файлын нэр"
                        rules={[{ required: true, message: "Файлын нэр оруулна уу" }]}
                    >
                        <Input placeholder="Файлын нэр оруулна уу" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Тодорхойлолт"
                    >
                        <TextArea rows={3} placeholder="Файлын тодорхойлолт оруулна уу" />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="Төрөл"
                        rules={[{ required: true, message: "Төрөл сонгоно уу" }]}
                    >
                        <Select placeholder="Select file type">
                            <Option value="nso-magazine">NSO Magazine</Option>
                            <Option value="magazine">Magazine</Option>
                            <Option value="census">Census</Option>
                            <Option value="survey">Survey</Option>
                            <Option value="infographic">Infographic</Option>
                            <Option value="weekprice">Week Price</Option>
                            <Option value="foreigntrade">Foreign Trade</Option>
                            <Option value="presentation">Presentation</Option>
                            <Option value="bulletin">Bulletin</Option>
                            <Option value="annual">Annual</Option>
                            <Option value="livingstandart">Living Standard</Option>
                            <Option value="agricultural_census">Agricultural Census</Option>
                            <Option value="enterprise_census">Enterprise Census</Option>
                            <Option value="livestock_census">Livestock Census</Option>
                            <Option value="pahc">PAHC</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="list_order"
                        label="Дараалал"
                    >
                        <Input type="number" placeholder="Enter list order" />
                    </Form.Item>

                    <Form.Item
                        name="data_viz_id"
                        label="Дата визуал"
                    >
                        <Input placeholder="Enter data visualization ID" />
                    </Form.Item>

                    <Form.Item
                        name="isPublic"
                        label="Төлөв"
                        valuePropName="checked"
                    >
                        <Select>
                            <Option value={true}>Нийтлэх</Option>
                            <Option value={false}>Нийтлэхгүй</Option>
                        </Select>
                    </Form.Item>

                    {!editingFile && (
                        <Form.Item
                            name="file"
                            label="Файл сонгох"
                            rules={[{ required: true, message: "Файл сонгоно уу" }]}
                        >
                            <Upload
                                beforeUpload={() => false}
                                maxCount={1}
                                accept="*/*"
                            >
                                <Button icon={<UploadOutlined />}>Файл сонгох</Button>
                            </Upload>
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingFile ? "Засварлах" : "Нэмэх"}
                            </Button>
                            <Button onClick={() => setIsModalVisible(false)}>
                                Болих
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
