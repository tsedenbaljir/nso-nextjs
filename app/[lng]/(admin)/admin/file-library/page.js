"use client";
import { useEffect, useState } from "react";
import { Button, Input, Table, Space, Modal, Form, Upload, message, Card, Typography, Select, DatePicker, Popconfirm, Row, Col, Statistic } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined, DownloadOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function FileLibraryAdmin() {
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingFile, setEditingFile] = useState(null);
    const [form] = Form.useForm();

    const [FilesChangeValues, setFilesChangeValues] = useState({});
    // Statistics state
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        unpublished: 0,
        types: {}
    });

    // Filters state
    const [filters, setFilters] = useState({
        lng: '',
        type: '',
        info: '',
        published: ''
    });

    // Pagination state
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20, // Show 20 rows per page
        total: 0
    });

    const fileTypes = [
        { value: 'nso-magazine', label: 'NSO Magazine' },
        { value: 'magazine', label: 'Magazine' },
        { value: 'census', label: 'Census' },
        { value: 'survey', label: 'Survey' },
        { value: 'infographic', label: 'Infographic' },
        { value: 'weekprice', label: 'Week Price' },
        { value: 'foreigntrade', label: 'Foreign Trade' },
        { value: 'presentation', label: 'Presentation' },
        { value: 'bulletin', label: 'Bulletin' },
        { value: 'annual', label: 'Annual' },
        { value: 'livingstandart', label: 'Living Standard' },
        { value: 'agricultural_census', label: 'Agricultural Census' },
        { value: 'enterprise_census', label: 'Enterprise Census' },
        { value: 'livestock_census', label: 'Livestock Census' },
        { value: 'pahc', label: 'PAHC' }
    ];
    const getExtension = (name) => {
        if (typeof name !== 'string') return '';
        const trimmed = name.trim();
        const i = trimmed.lastIndexOf('.');
        return i > 0 ? trimmed.slice(i + 1).toLowerCase() : trimmed.toLowerCase();
    };
    // Create file info object with detailed metadata
    const createFileInfo = (input) => {
        const currentDate = new Date().toISOString();
        const isStringInput = typeof input === 'string';
        const name = isStringInput ? input : input?.name;
        const size = isStringInput ? undefined : input?.size;
        const type = isStringInput ? undefined : input?.type;
        const extension = getExtension(name);
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
            originalName: name || '',
            pathName: name || '',
            fileSize: size || 0,
            type: type || '',
            extension: extension,
            mediaType: mediaTypes[extension] || 'application/octet-stream',
            pages: 1,
            downloads: 0,
            isPublic: true,
            createdDate: currentDate
        };
    };

    // Calculate statistics from data
    const calculateStats = (data) => {
        return {
            total: data.length,
            published: data.filter(item => item.isPublic === 1 || item.isPublic === '1' || item.isPublic === true).length,
            unpublished: data.filter(item => item.isPublic === 0 || item.isPublic === '0' || item.isPublic === false).length,
            types: data.reduce((acc, item) => {
                const type = item.type || item.file_type;
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {})
        };
    };

    // Get paginated data for display
    const getPaginatedData = (data) => {
        const startIndex = (pagination.current - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        return data.slice(startIndex, endIndex);
    };

    // Fetch files from API
    const fetchFiles = async () => {
        setLoading(true);
        try {
            // Build query parameters - no pagination parameters needed
            const params = new URLSearchParams();
            if (searchTerm) params.append('searchTerm', searchTerm);
            if (filters.type) params.append('type', filters.type);
            if (filters.published !== '') params.append('published', filters.published);
            if (filters.lng) params.append('lng', filters.lng);

            const response = await fetch(`/api/file-library/admin?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();

                // Ensure data.data is always an array
                let fileData = [];
                if (data.success && data.data) {
                    if (Array.isArray(data.data)) {
                        fileData = data.data;
                    } else {
                        // If data.data is not an array, wrap it in an array
                        fileData = [data.data];
                    }
                }

                setFilteredData(fileData);
                setStats(calculateStats(fileData));
                setPagination(prev => ({
                    ...prev,
                    total: fileData.length,
                    current: 1
                }));
            }
        } catch (error) {
            console.error("Error fetching files:", error);
            message.error("Failed to fetch files");
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [searchTerm, filters.type, filters.published, filters.lng]);

    // Handle file operations
    const handleAdd = () => {
        setEditingFile(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingFile(record);
        form.setFieldsValue({
            title: record.title || record.name,
            description: record.description || record.info,
            type: record.type || record.file_type,
            lng: record.lng || record.language,
            isPublic: record.isPublic === 1 || record.published === 1 || record.isPublic,
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
                    title: record.title || record.name,
                    description: record.description || record.info,
                    type: record.type || record.file_type,
                    lng: record.lng || record.language,
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
                        ...createFileInfo(uploadedFileName),
                        fileName: uploadedFileName,
                        fileSize: values.file.fileList[0].size,
                        filePath: `/uploads/${uploadedFileName}`,
                    };
                    // Create the file record in database
                    const requestBody = {
                        title: values.title,
                        description: values.description,
                        type: values.type,
                        lng: values.lng,
                        isPublic: values.isPublic,
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
                        message.success("Амжилттай нэмэгдлээ");
                        setIsModalVisible(false);
                        fetchFiles();
                    } else {
                        message.error(responseData.error || "Файл нэмэгдэхэд алдаа гарлаа");
                    }
                }
            } else {
                // For editing existing files
                let requestBody = {
                    id: editingFile.id,
                    title: values.title,
                    description: values.description,
                    type: values.type,
                    lng: values.lng,
                    isPublic: values.isPublic,
                };
                // Check if a new file was uploaded during editing
                if (FilesChangeValues.file && FilesChangeValues.fileList.length > 0) {
                    const file = FilesChangeValues.fileList[0].originFileObj;

                    // Upload the new file
                    const uploadedFileName = await uploadFile(file);

                    // Create file info with the uploaded filename
                    const fileInfo = {
                        ...createFileInfo(uploadedFileName),
                        fileName: uploadedFileName,
                        fileSize: FilesChangeValues.fileList[0].size,
                        filePath: `/uploads/${uploadedFileName}`,
                    };
                    requestBody.fileInfo = fileInfo;
                }

                const response = await fetch(url, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });

                const responseData = await response.json();

                if (response.ok && responseData.success) {
                    message.success("Файл амжилттай шинэчлэгдлээ");
                    setIsModalVisible(false);
                    fetchFiles();
                } else {
                    message.error(responseData.error || "Файл шинэчлэхэд алдаа гарлаа");
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

    // Handle filter changes
    const handleFilter = () => {
        fetchFiles();
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            lng: '',
            type: '',
            info: '',
            published: ''
        });
        setSearchTerm('');
        fetchFiles();
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
                <Title level={2}>Файлын сан</Title>
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
                            value={filters.lng}
                            onChange={(value) => {
                                setFilters(prev => ({ ...prev, lng: value }));
                            }}
                            style={{ width: 120 }}
                            placeholder="Хэл сонгоно уу"
                            allowClear
                        >
                            <Option value="mn">Монгол</Option>
                            <Option value="en">English</Option>
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
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Search and Add */}
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
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
                dataSource={getPaginatedData(filteredData)}
                loading={loading}
                rowKey="id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredData.length,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['10', '20', '25', '50', '100'],
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} файл`,
                    onChange: (page, pageSize) => {
                        setPagination(prev => ({
                            ...prev,
                            current: page,
                            pageSize: pageSize
                        }));
                    }
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
                        name="lng"
                        label="Хэл"
                        rules={[{ required: true, message: "Хэл сонгоно уу" }]}
                    >
                        <Select placeholder="Хэл сонгоно уу">
                            <Option value="mn">Монгол</Option>
                            <Option value="en">English</Option>
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

                    <Form.Item
                        name="file"
                        label={editingFile ? "Файл солих (сонгохгүй бол хуучин файл хэвээр үлдэнэ)" : "Файл сонгох"}
                        rules={[{ required: !editingFile ? true : false, message: "Файл сонгоно уу" }]}
                    >
                        {
                            editingFile && editingFile.file_info ?
                                <Upload
                                    beforeUpload={() => false}
                                    maxCount={1}
                                    accept="*/*"
                                    onChange={(values) => {
                                        console.log("values========>", values);
                                        setFilesChangeValues(values);
                                    }}
                                >
                                    <Button icon={<UploadOutlined />}>
                                        Шинэ файл сонгох
                                    </Button>
                                </Upload> :
                                <Upload
                                    beforeUpload={() => false}
                                    maxCount={1}
                                    accept="*/*"
                                >
                                    <Button icon={<UploadOutlined />}>
                                        Файл сонгох
                                    </Button>
                                </Upload>
                        }
                        {editingFile && editingFile.file_info && (
                            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                                Одоогийн файл: {(() => {
                                    try {
                                        const fileInfo = JSON.parse(editingFile.file_info);
                                        return fileInfo.originalName || 'Unknown file';
                                    } catch {
                                        return 'Unknown file';
                                    }
                                })()}
                            </div>
                        )}
                    </Form.Item>

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
