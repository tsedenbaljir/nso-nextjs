"use client"
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ArrowLeftOutlined,
    UploadOutlined,
    DownloadOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    FileTextOutlined,
} from '@ant-design/icons';
import { Button, Modal, Form, Input, Select, message, Tabs, Spin, Upload } from 'antd';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';

const { TextArea } = Input;
const { Option } = Select;

function parseFileInfo(raw) {
    if (!raw) return null;
    try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
        return null;
    }
}

/** Legacy single excel object or { excel, pdf, tushaal } */
function normalizeFilesBundle(raw) {
    const empty = { excel: null, pdf: null, tushaal: null };
    const parsed = parseFileInfo(raw);
    if (!parsed) return empty;
    if (
        parsed.excel !== undefined ||
        parsed.pdf !== undefined ||
        parsed.tushaal !== undefined
    ) {
        return {
            excel: parsed.excel || null,
            pdf: parsed.pdf || null,
            tushaal: parsed.tushaal || null,
        };
    }
    if (parsed.pathName) return { excel: parsed, pdf: null, tushaal: null };
    return empty;
}

function getFileUrl(fileInfo) {
    if (!fileInfo?.pathName) return null;
    const pathName = String(fileInfo.pathName).replace(/^\/+/, '').replace(/^uploads\//, '');
    return `/uploads/${pathName}`;
}

export default function ClassificationDetailAdmin(props0) {
    const { lng, id } = use(props0.params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [mainRecord, setMainRecord] = useState(null);

    // General info (meta_data_value)
    const [generalData, setGeneralData] = useState([]);
    const [metaFields, setMetaFields] = useState([]);
    const [generalModal, setGeneralModal] = useState(false);
    const [generalEditingId, setGeneralEditingId] = useState(null);
    const [generalForm] = Form.useForm();

    // Main record (indicator) edit
    const [mainModal, setMainModal] = useState(false);
    const [mainForm] = Form.useForm();

    // Files
    const [uploading, setUploading] = useState({ excel: false, pdf: false, tushaal: false });

    const filesBundle = normalizeFilesBundle(mainRecord?.file_info);

    const fetchMain = async () => {
        try {
            const res = await fetch(`/api/methodology/classification/admin?id=${id}`, { cache: 'no-store' });
            const result = await res.json();
            if (result.status) setMainRecord(result.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchGeneral = async () => {
        try {
            const res = await fetch(
                `/api/methodology/classification/meta?classification_code_id=${id}`,
                { cache: 'no-store' }
            );
            const result = await res.json();
            if (result.status) {
                setGeneralData(result.data || []);
                setMetaFields(result.fields || []);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const loadAll = async () => {
        setLoading(true);
        await Promise.all([fetchMain(), fetchGeneral()]);
        setLoading(false);
    };

    useEffect(() => {
        loadAll();
    }, [id]);

    /* ---------- General info (Ерөнхий мэдээлэл) ---------- */
    const openGeneralAdd = () => {
        setGeneralEditingId(null);
        generalForm.resetFields();
        setGeneralModal(true);
    };

    const openGeneralEdit = (row) => {
        setGeneralEditingId(row.id);
        generalForm.setFieldsValue({
            meta_data_id: row.meta_data_id,
            valuemn: row.valuemn,
            valueen: row.valueen,
        });
        setGeneralModal(true);
    };

    const submitGeneral = async (values) => {
        try {
            const method = generalEditingId ? 'PUT' : 'POST';
            const body = {
                id: generalEditingId || undefined,
                classification_code_id: id,
                meta_data_id: values.meta_data_id,
                valuemn: values.valuemn,
                valueen: values.valueen,
            };
            const res = await fetch('/api/methodology/classification/meta', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await res.json();
            if (result.status) {
                message.success(result.message);
                setGeneralModal(false);
                generalForm.resetFields();
                fetchGeneral();
            } else {
                message.error(result.message);
            }
        } catch (e) {
            message.error('Алдаа гарлаа');
        }
    };

    const deleteGeneral = (rowId) => {
        confirmDialog({
            message: 'Энэ мөрийг устгах уу?',
            header: 'Устгах уу?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Тийм',
            rejectLabel: 'Үгүй',
            accept: async () => {
                const res = await fetch(`/api/methodology/classification/meta?id=${rowId}`, { method: 'DELETE' });
                const result = await res.json();
                if (result.status) {
                    message.success('Амжилттай устгалаа');
                    fetchGeneral();
                } else {
                    message.error(result.message);
                }
            },
        });
    };

    /* ---------- Main record (Үзүүлэлтийн мэдээлэл) ---------- */
    const openMainEdit = () => {
        if (!mainRecord) return;
        mainForm.setFieldsValue({
            namemn: mainRecord.namemn,
            nameen: mainRecord.nameen,
            code: mainRecord.code,
            descriptionmn: mainRecord.descriptionmn,
            descriptionen: mainRecord.descriptionen,
            active: mainRecord.active ?? 1,
        });
        setMainModal(true);
    };

    const submitMain = async (values) => {
        try {
            const res = await fetch('/api/methodology/classification/admin', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...values }),
            });
            const result = await res.json();
            if (result.status) {
                message.success(result.message);
                setMainModal(false);
                fetchMain();
            } else {
                message.error(result.message);
            }
        } catch (e) {
            message.error('Алдаа гарлаа');
        }
    };

    /* ---------- File upload / delete (excel | pdf) ---------- */
    const uploadFile = async (file, type) => {
        const name = file?.name || '';
        const ext = name.split('.').pop()?.toLowerCase();
        if (type === 'excel' && !['xlsx', 'xls'].includes(ext)) {
            message.error('Зөвхөн .xlsx эсвэл .xls файл оруулна уу');
            return Upload.LIST_IGNORE;
        }
        if (type === 'pdf' && ext !== 'pdf') {
            message.error('Зөвхөн .pdf файл оруулна уу');
            return Upload.LIST_IGNORE;
        }
        if (
            type === 'tushaal' &&
            !['pdf', 'doc', 'docx', 'xlsx', 'xls', 'jpg', 'jpeg', 'png'].includes(ext)
        ) {
            message.error('Тушаалын файл: pdf, doc, docx, xlsx гэх мэт');
            return Upload.LIST_IGNORE;
        }

        setUploading((s) => ({ ...s, [type]: true }));
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('id', id);
            formData.append('type', type);

            const res = await fetch('/api/methodology/classification/file', {
                method: 'POST',
                body: formData,
            });
            const result = await res.json();
            if (result.status) {
                message.success(result.message || 'Файл амжилттай хадгаллаа');
                fetchMain();
            } else {
                message.error(result.message || 'Файл хуулахад алдаа гарлаа');
            }
        } catch (e) {
            message.error('Файл хуулахад алдаа гарлаа');
        } finally {
            setUploading((s) => ({ ...s, [type]: false }));
        }

        return false;
    };

    const deleteFile = (type) => {
        const label =
            type === 'pdf' ? 'PDF' : type === 'tushaal' ? 'Тушаал' : 'Excel';
        confirmDialog({
            message: `Оруулсан ${label} файлыг устгах уу?`,
            header: 'Устгах уу?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Тийм',
            rejectLabel: 'Үгүй',
            accept: async () => {
                const res = await fetch(
                    `/api/methodology/classification/file?id=${id}&type=${type}`,
                    { method: 'DELETE' }
                );
                const result = await res.json();
                if (result.status) {
                    message.success(result.message || 'Файл устгалаа');
                    fetchMain();
                } else {
                    message.error(result.message || 'Файл устгахад алдаа гарлаа');
                }
            },
        });
    };

    const FileSlot = ({ type, title, accept, icon }) => {
        const info = filesBundle[type];
        const url = getFileUrl(info);
        return (
            <div className="flex-1 min-w-[260px] p-3 border border-gray-200 rounded-md bg-white">
                <div className="flex items-center gap-2 mb-2">
                    {icon}
                    <div className="font-medium">{title}</div>
                </div>
                {info ? (
                    <div className="text-sm text-gray-600 truncate mb-3" title={info.originalName || info.pathName}>
                        {info.originalName || info.pathName}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 mb-3">
                        Файл оруулаагүй
                    </div>
                )}
                <div className="flex flex-wrap gap-2">
                    {url && (
                        <Button
                            icon={<DownloadOutlined />}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Татах
                        </Button>
                    )}
                    <Upload
                        accept={accept}
                        showUploadList={false}
                        beforeUpload={(file) => uploadFile(file, type)}
                        disabled={uploading[type]}
                    >
                        <Button type="primary" icon={<UploadOutlined />} loading={uploading[type]}>
                            {info ? 'Файл солих' : 'Оруулах'}
                        </Button>
                    </Upload>
                    {info && (
                        <Button danger icon={<DeleteOutlined />} onClick={() => deleteFile(type)}>
                            Устгах
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    const indexTemplate = (rowData, options) => options.rowIndex + 1;

    const generalActions = (row) => (
        <div className="flex gap-2">
            <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => openGeneralEdit(row)} />
            <Button danger size="small" icon={<DeleteOutlined />} onClick={() => deleteGeneral(row.id)} />
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    const tabItems = [
        {
            key: 'general',
            label: 'Ерөнхий мэдээлэл',
            children: (
                <div>
                    <div className="flex justify-end mb-3">
                        <Button type="primary" icon={<PlusOutlined />} onClick={openGeneralAdd}>
                            Мэдээлэл нэмэх
                        </Button>
                    </div>
                    <DataTable value={generalData} className="p-datatable-sm" emptyMessage="Мэдээлэл олдсонгүй">
                        <Column header="#" body={indexTemplate} style={{ width: 50 }} />
                        <Column field="field_namemn" header="Нэр" style={{ width: '20%' }} />
                        <Column field="valuemn" header="Монгол" style={{ width: '35%' }} />
                        <Column field="valueen" header="Англи" style={{ width: '30%' }} />
                        <Column body={generalActions} header="Үйлдэл" style={{ width: '15%' }} />
                    </DataTable>
                </div>
            ),
        },
        {
            key: 'indicators',
            label: 'Үзүүлэлтийн мэдээлэл',
            children: (
                <div>
                    <div className="flex justify-end mb-3">
                        <Button type="primary" icon={<EditOutlined />} onClick={openMainEdit}>
                            Засварлах
                        </Button>
                    </div>
                    <DataTable value={mainRecord ? [mainRecord] : []} className="p-datatable-sm" emptyMessage="Мэдээлэл олдсонгүй">
                        <Column header="#" body={indexTemplate} style={{ width: 50 }} />
                        <Column field="namemn" header="Нэр" style={{ width: '20%' }} />
                        <Column field="code" header="Код" style={{ width: '15%' }} />
                        <Column field="descriptionmn" header="Тодорхойлолт" style={{ width: '35%' }} />
                        <Column field="nameen" header="Англи нэр" style={{ width: '20%' }} />
                    </DataTable>
                </div>
            ),
        },
    ];

    return (
        <div className="p-3">
            <ConfirmDialog />
            <div className="flex items-center gap-3 mb-2">
                <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/${lng}/admin/classification`)}>
                    Буцах
                </Button>
                <h1 className="text-2xl font-bold m-0">
                    {mainRecord ? mainRecord.namemn : 'Ангилал'}
                </h1>
            </div>
            {mainRecord?.descriptionmn && (
                <p className="text-gray-500 mb-4">{mainRecord.descriptionmn}</p>
            )}

            <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
                <div className="font-medium mb-3">Файл оруулах</div>
                <div className="flex flex-wrap gap-3">
                    <FileSlot
                        type="excel"
                        title="Excel файл"
                        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        icon={<FileExcelOutlined className="text-green-600 text-lg" />}
                    />
                    <FileSlot
                        type="pdf"
                        title="PDF файл"
                        accept=".pdf,application/pdf"
                        icon={<FilePdfOutlined className="text-red-600 text-lg" />}
                    />
                    <FileSlot
                        type="tushaal"
                        title="Тушаал"
                        accept=".pdf,.doc,.docx,.xlsx,.xls,.jpg,.jpeg,.png,application/pdf"
                        icon={<FileTextOutlined className="text-blue-600 text-lg" />}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-3 mb-0">
                    PDF/Excel — «Татах» товч. Тушаал — ерөнхий мэдээлэл дэх «Тушаал» нэрийг холбоос болгоно.
                    Тушаалын нэр/утгыг өмнөх шиг Ерөнхий мэдээлэлд бичнэ.
                </p>
            </div>

            <Tabs defaultActiveKey="general" items={tabItems} />

            {/* General info modal */}
            <Modal
                title={generalEditingId ? 'Ерөнхий мэдээлэл засах' : 'Ерөнхий мэдээлэл нэмэх'}
                open={generalModal}
                onCancel={() => setGeneralModal(false)}
                footer={null}
                width={700}
            >
                <Form form={generalForm} layout="vertical" onFinish={submitGeneral}>
                    <Form.Item name="meta_data_id" label="Нэр (талбар)" rules={[{ required: true }]}>
                        <Select
                            placeholder="Талбар сонгох"
                            showSearch
                            optionFilterProp="children"
                        >
                            {metaFields.map((f) => (
                                <Option key={f.id} value={f.id}>
                                    {lng === 'mn' ? f.namemn : f.nameen || f.namemn}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="valuemn" label="Монгол утга" rules={[{ required: true }]}>
                        <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="valueen" label="Англи утга">
                        <TextArea rows={2} />
                    </Form.Item>
                    <Form.Item className="mb-0 text-right">
                        <Button onClick={() => setGeneralModal(false)} className="mr-2">Болих</Button>
                        <Button type="primary" htmlType="submit">Хадгалах</Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Main record (indicator) modal */}
            <Modal
                title="Үзүүлэлтийн мэдээлэл засах"
                open={mainModal}
                onCancel={() => setMainModal(false)}
                footer={null}
                width={700}
            >
                <Form form={mainForm} layout="vertical" onFinish={submitMain}>
                    <Form.Item name="code" label="Код">
                        <Input />
                    </Form.Item>
                    <Form.Item name="namemn" label="Нэр (Монгол)" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="nameen" label="Нэр (Англи)" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="descriptionmn" label="Тодорхойлолт (Монгол)">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="descriptionen" label="Тодорхойлолт (Англи)">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="active" label="Төлөв" initialValue={1}>
                        <Select>
                            <Option value={1}>Идэвхтэй</Option>
                            <Option value={0}>Идэвхгүй</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item className="mb-0 text-right">
                        <Button onClick={() => setMainModal(false)} className="mr-2">Болих</Button>
                        <Button type="primary" htmlType="submit">Хадгалах</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
