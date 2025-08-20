"use client";
import { useEffect, useState } from "react";
import { Button, Input, Table, Space, Modal, Form, Upload, message, Card, Typography, Select, DatePicker, Popconfirm } from "antd";
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

    // Create file info object with detailed metadata
    const createFileInfo = (file) => {
        const currentDate = new Date().toISOString();
        const extension = file.name.split('.').pop().toLowerCase();

        // Determine media type based on extension
        const mediaTypes = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt': 'text/plain',
            'csv': 'text/csv',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed'
        };

        return {
            originalName: file.name,
            pathName: file.name,
            fileSize: file.size,
            type: file.type,
            extension: extension,
            mediaType: mediaTypes[extension] || 'application/octet-stream',
            pages: 1,
            downloads: 0,
            isPublic: true,
            createdDate: currentDate
        };
    };

    // Fetch files from API
    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/file-library/admin?lng=${lng}&searchTerm=${searchTerm}`);
            if (response.ok) {
                const data = await response.json();

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
                message.success("Файл амжилттай устгагдлаа");
                fetchFiles();
            } else {
                message.error("Файл устгахад алдаа гарлаа");
            }
        } catch (error) {
            console.error("Error deleting file:", error);
            message.error("Файл устгахад алдаа гарлаа");
        }
    };

    const handleTogglePublish = async (record) => {
        try {
            const response = await fetch("/api/file-library/admin", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: record.id,
                    title: record.title,
                    description: record.description,
                    type: record.type,
                    isPublic: !record.isPublic,
                }),
            });

            if (response.ok) {
                message.success(record.isPublic ? "File unpublished successfully" : "File published successfully");
                fetchFiles();
            } else {
                message.error("Failed to update file status");
            }
        } catch (error) {
            console.error("Error updating file status:", error);
            message.error("Failed to update file status");
        }
    };

    // Upload file using the existing upload API
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
        try {
            const url = "/api/file-library/admin";

            if (!editingFile) {
                if (values.file && values.file.fileList && values.file.fileList.length > 0) {
                    // For new files, upload the actual file first
                    const file = values.file.fileList[0].originFileObj;

                    // Upload file using the existing upload API
                    const uploadedFileName = await uploadFile(file);

                    // Create file info with the uploaded filename
                    const fileInfo = {
                        ...createFileInfo(file),
                        fileName: uploadedFileName,
                        filePath: `/uploads/${uploadedFileName}`,
                    };

                    // Create the file record in database
                    const requestBody = {
                        title: values.title,
                        description: values.description,
                        type: values.type,
                        isPublic: values.isPublic,
                        lng,
                        fileInfo: fileInfo,
                    };

                    const response = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(requestBody),
                    });

                    const responseData = await response.json();

                    if (response.ok && responseData.success) {
                        message.success("File uploaded successfully");
                        setIsModalVisible(false);
                        fetchFiles();
                    } else {
                        message.error(responseData.error || "Failed to upload file");
                    }
                }
            } else {
                if (values.file && values.file.fileList && values.file.fileList.length > 0) {
                    const file = values.file.fileList[0].originFileObj;

                    // Upload file using the existing upload API
                    const uploadedFileName = await uploadFile(file);

                    // Create file info with the uploaded filename
                    const fileInfo = {
                        ...createFileInfo(file),
                        fileName: uploadedFileName,
                        filePath: `/uploads/${uploadedFileName}`,
                    };

                    // For editing existing files, just update metadata
                    const requestBody = {
                        title: values.title,
                        description: values.description,
                        type: values.type,
                        isPublic: values.isPublic,
                        lng,
                        id: editingFile.id,
                        fileInfo: fileInfo,
                    };

                    const response = await fetch(url, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(requestBody),
                    });

                    const responseData = await response.json();

                    if (response.ok && responseData.success) {
                        message.success("File updated successfully");
                        setIsModalVisible(false);
                        fetchFiles();
                    } else {
                        message.error(responseData.error || "Failed to update file");
                    }
                }
            }
        } catch (error) {
            console.error("Error saving file:", error);
            message.error("Failed to save file");
        }
    };

    const handleDownload = async (file) => {
        try {
            // Parse file info to get the file path
            let filePath = null;
            let originalName = file.title;

            if (file.file_info) {
                try {
                    const fileInfo = JSON.parse(file.file_info);
                    filePath = fileInfo.filePath;
                    originalName = fileInfo.originalName || file.title;
                } catch (e) {
                    console.error("Error parsing file info:", e);
                }
            }

            if (filePath) {
                // Download from the uploaded file path
                const response = await fetch(filePath);
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = originalName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } else {
                    message.error("File not found");
                }
            } else {
                // Fallback to API download
                const response = await fetch(`/api/file-library/download/${file.id}`);
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = originalName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } else {
                    message.error("Failed to download file");
                }
            }
        } catch (error) {
            console.error("Error downloading file:", error);
            message.error("Failed to download file");
        }
    };

    // Table columns
    const columns = [
        {
            title: "Гарчиг",
            dataIndex: "title",
            key: "title",
            sorter: (a, b) => a.title.localeCompare(b.title),
        },
        {
            title: "Төрөл",
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
            title: "Файлын мэдээлэл",
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
            title: "Файлын хэмжээ",
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
            title: "Татах",
            dataIndex: "downloads",
            key: "downloads",
            sorter: (a, b) => a.downloads - b.downloads,
        },
        {
            title: "Төлөв",
            dataIndex: "isPublic",
            key: "isPublic",
            render: (isPublic) => (
                <span style={{ color: isPublic ? "green" : "red" }}>
                    {isPublic ? "Yes" : "No"}
                </span>
            ),
        },
        {
            title: "Үүсгэсэн огноо",
            dataIndex: "createdDate",
            key: "createdDate",
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
        },
        {
            title: "Үүсгэсэн огноо",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        size="small"
                        onClick={() => handleDownload(record)}
                    >
                        Татах
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    >
                        Засварлах
                    </Button>
                    <Button
                        type={record.isPublic ? "default" : "primary"}
                        size="small"
                        onClick={() => handleTogglePublish(record)}
                    >
                        {record.isPublic ? "Нийтлэхгүй болгох" : "Нийтлэх"}
                    </Button>
                    <Popconfirm
                        title="Устгахдаа итгэлтэй байна уу?"
                        description="Энэ файлыг устгасны дараа сэргээх боломжгүй."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Тийм"
                        cancelText="Үгүй"
                        placement="left"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            Устгах
                        </Button>
                    </Popconfirm>
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
                        <Select placeholder="Төрөл сонгоно уу">
                            <Option value="nso-magazine">Үндэсний статистик сэтгүүл</Option>
                            <Option value="magazine">Ном, товхимол</Option>
                            <Option value="census">Тооллого</Option>
                            <Option value="survey">Түүвэр судалгаа</Option>
                            <Option value="infographic">Инфографик</Option>
                            <Option value="weekprice">7 хоногийн үнийн мэдээ</Option>
                            <Option value="foreigntrade">15 хоногийн гадаад худалдааны мэдээ</Option>
                            <Option value="presentation">Сарын мэдээний презентац</Option>
                            <Option value="bulletin">Сарын танилцуулга</Option>
                            <Option value="annual">Жилийн эмхэтгэл</Option>
                            <Option value="livingstandart">Амьжиргааны доод түвшин</Option>
                            <Option value="agricultural_census">ХААТ</Option>
                            <Option value="enterprise_census">ААНБТ</Option>
                            <Option value="livestock_census">Мал тооллого</Option>
                            <Option value="pahc">ХАОСТ</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="isPublic"
                        label="Төлөв"
                        valuePropName="checked"
                    >
                        <Select placeholder="Төлөв сонгоно уу">
                            <Option value={true}>Нийтлэх</Option>
                            <Option value={false}>Нийтлэхгүй</Option>
                        </Select>
                    </Form.Item>

                    {/* {!editingFile && ( */}
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
                    {/* )} */}

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
