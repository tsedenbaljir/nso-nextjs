"use client"
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import { Button, Modal, Form, Input, Select, message, Tabs, Spin } from 'antd';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';

const { TextArea } = Input;
const { Option } = Select;

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

    // Sub-classification codes
    const [subData, setSubData] = useState([]);
    const [subModal, setSubModal] = useState(false);
    const [subEditingId, setSubEditingId] = useState(null);
    const [subForm] = Form.useForm();

    // Main record (indicator) edit
    const [mainModal, setMainModal] = useState(false);
    const [mainForm] = Form.useForm();

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

    const fetchSub = async () => {
        try {
            const res = await fetch(
                `/api/methodology/classification/sub?classification_code_id=${id}`,
                { cache: 'no-store' }
            );
            const result = await res.json();
            if (result.status) setSubData(result.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const loadAll = async () => {
        setLoading(true);
        await Promise.all([fetchMain(), fetchGeneral(), fetchSub()]);
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

    /* ---------- Sub-classification (Ангилал, кодын мэдээлэл) ---------- */
    const openSubAdd = () => {
        setSubEditingId(null);
        subForm.resetFields();
        subForm.setFieldsValue({ active: 1 });
        setSubModal(true);
    };

    const openSubEdit = (row) => {
        setSubEditingId(row.id);
        subForm.setFieldsValue({
            namemn: row.namemn,
            nameen: row.nameen,
            code: row.code,
            app_order: row.app_order,
            active: row.active ?? 1,
        });
        setSubModal(true);
    };

    const submitSub = async (values) => {
        try {
            const method = subEditingId ? 'PUT' : 'POST';
            const body = {
                id: subEditingId || undefined,
                classification_code_id: id,
                namemn: values.namemn,
                nameen: values.nameen,
                code: values.code,
                app_order: values.app_order,
                active: values.active ?? 1,
            };
            const res = await fetch('/api/methodology/classification/sub', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await res.json();
            if (result.status) {
                message.success(result.message);
                setSubModal(false);
                subForm.resetFields();
                fetchSub();
            } else {
                message.error(result.message);
            }
        } catch (e) {
            message.error('Алдаа гарлаа');
        }
    };

    const deleteSub = (rowId) => {
        confirmDialog({
            message: 'Энэ ангиллын кодыг устгах уу?',
            header: 'Устгах уу?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Тийм',
            rejectLabel: 'Үгүй',
            accept: async () => {
                const res = await fetch(`/api/methodology/classification/sub?id=${rowId}`, { method: 'DELETE' });
                const result = await res.json();
                if (result.status) {
                    message.success('Амжилттай устгалаа');
                    fetchSub();
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

    const indexTemplate = (rowData, options) => options.rowIndex + 1;

    const generalActions = (row) => (
        <div className="flex gap-2">
            <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => openGeneralEdit(row)} />
            <Button danger size="small" icon={<DeleteOutlined />} onClick={() => deleteGeneral(row.id)} />
        </div>
    );

    const subActions = (row) => (
        <div className="flex gap-2">
            <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => openSubEdit(row)} />
            <Button danger size="small" icon={<DeleteOutlined />} onClick={() => deleteSub(row.id)} />
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
        {
            key: 'classification',
            label: 'Ангилал, кодын мэдээлэл',
            children: (
                <div>
                    <div className="flex justify-end mb-3">
                        <Button type="primary" icon={<PlusOutlined />} onClick={openSubAdd}>
                            Код нэмэх
                        </Button>
                    </div>
                    <DataTable value={subData} className="p-datatable-sm" paginator rows={20} emptyMessage="Мэдээлэл олдсонгүй">
                        <Column header="#" body={indexTemplate} style={{ width: 50 }} />
                        <Column field="namemn" header="Нэр" style={{ width: '30%' }} />
                        <Column field="code" header="Код" style={{ width: '20%' }} />
                        <Column field="nameen" header="Англи нэр" style={{ width: '30%' }} />
                        <Column body={subActions} header="Үйлдэл" style={{ width: '15%' }} />
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

            {/* Sub-classification modal */}
            <Modal
                title={subEditingId ? 'Код засах' : 'Код нэмэх'}
                open={subModal}
                onCancel={() => setSubModal(false)}
                footer={null}
                width={700}
            >
                <Form form={subForm} layout="vertical" onFinish={submitSub}>
                    <Form.Item name="namemn" label="Нэр (Монгол)" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="nameen" label="Нэр (Англи)" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="code" label="Код">
                        <Input />
                    </Form.Item>
                    <Form.Item name="app_order" label="Эрэмбэ">
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="active" label="Төлөв" initialValue={1}>
                        <Select>
                            <Option value={1}>Идэвхтэй</Option>
                            <Option value={0}>Идэвхгүй</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item className="mb-0 text-right">
                        <Button onClick={() => setSubModal(false)} className="mr-2">Болих</Button>
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
