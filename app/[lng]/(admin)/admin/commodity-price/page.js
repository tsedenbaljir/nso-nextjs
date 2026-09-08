"use client";

import React, { useCallback, useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, InputNumber, Modal, Select, message } from "antd";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { PRICE_DATA_PRODUCTS } from "@/app/lib/commodity-price-products";

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}-р сар`,
}));

function formatPrice(value) {
    if (value == null || !Number.isFinite(Number(value))) return "—";
    return String(Math.round(Number(value))).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export default function CommodityPriceAdminPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState([]);
    const [products, setProducts] = useState(PRICE_DATA_PRODUCTS);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingKey, setEditingKey] = useState(null); // "YYYY-MM" or null
    const [filterYear, setFilterYear] = useState(undefined);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 15,
        total: 0,
    });

    const fetchData = useCallback(
        async (page = 1, pageSize = 15, yearFilter = filterYear) => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: String(page - 1),
                    pageSize: String(pageSize),
                });
                if (yearFilter != null && yearFilter !== "") {
                    params.set("filterYear", String(yearFilter));
                }
                const res = await fetch(`/api/commodity-price/admin?${params}`, {
                    cache: "no-store",
                });
                const result = await res.json();
                if (result.status) {
                    setData(result.data || []);
                    if (result.products?.length) setProducts(result.products);
                    setPagination({
                        current: page,
                        pageSize,
                        total: result.pagination?.total ?? 0,
                    });
                } else {
                    message.error(result.message || "Алдаа гарлаа");
                }
            } catch (err) {
                console.error(err);
                message.error("Жагсаалт татахад алдаа гарлаа");
            } finally {
                setLoading(false);
            }
        },
        [filterYear]
    );

    useEffect(() => {
        fetchData(1, pagination.pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onPage = (event) => {
        fetchData(event.page + 1, event.rows, filterYear);
    };

    const openCreate = () => {
        setEditingKey(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (row) => {
        setEditingKey(row.id);
        const values = {
            year: row.year,
            month: row.month,
        };
        for (const p of products) {
            values[p.code] = row[p.code] ?? null;
        }
        form.setFieldsValue(values);
        setModalVisible(true);
    };

    const handleDelete = (row) => {
        confirmDialog({
            message: `${row.year} оны ${row.month}-р сарын үнийн өгөгдлийг устгах уу?`,
            header: "Устгах уу?",
            icon: "pi pi-exclamation-triangle",
            acceptLabel: "Тийм",
            rejectLabel: "Үгүй",
            accept: async () => {
                try {
                    const res = await fetch(
                        `/api/commodity-price/admin?year=${row.year}&month=${row.month}`,
                        { method: "DELETE" }
                    );
                    const result = await res.json();
                    if (result.status) {
                        message.success("Амжилттай устгалаа");
                        fetchData(pagination.current, pagination.pageSize, filterYear);
                    } else {
                        message.error(result.message || "Алдаа гарлаа");
                    }
                } catch (err) {
                    console.error(err);
                    message.error("Устгахад алдаа гарлаа");
                }
            },
        });
    };

    const handleSubmit = async (values) => {
        setSaving(true);
        try {
            const body = {
                year: values.year,
                month: values.month,
            };
            for (const p of products) {
                body[p.code] = values[p.code] ?? null;
            }

            const res = await fetch("/api/commodity-price/admin", {
                method: editingKey ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                cache: "no-store",
            });
            const result = await res.json();
            if (result.status) {
                message.success(
                    editingKey ? "Амжилттай шинэчлэгдлээ" : "Амжилттай нэмэгдлээ"
                );
                setModalVisible(false);
                form.resetFields();
                setEditingKey(null);
                fetchData(pagination.current, pagination.pageSize, filterYear);
            } else {
                message.error(result.message || "Алдаа гарлаа");
            }
        } catch (err) {
            console.error(err);
            message.error("Хадгалахад алдаа гарлаа");
        } finally {
            setSaving(false);
        }
    };

    const actionBody = (row) => (
        <div className="flex gap-2">
            <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(row)} />
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(row)} />
        </div>
    );

    const yearOptions = Array.from({ length: 40 }, (_, i) => {
        const y = new Date().getFullYear() + 1 - i;
        return { value: y, label: String(y) };
    });

    return (
        <div>
            <ConfirmDialog />
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pt-3 px-3">
                <h1 className="text-2xl font-bold">Гол нэрийн барааны үнэ</h1>
                <div className="flex flex-wrap items-center gap-2">
                    <Select
                        allowClear
                        placeholder="Оноор шүүх"
                        style={{ width: 140 }}
                        value={filterYear}
                        options={yearOptions}
                        onChange={(v) => {
                            setFilterYear(v);
                            fetchData(1, pagination.pageSize, v);
                        }}
                    />
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                        Үнэ нэмэх
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
                scrollable
                scrollHeight="65vh"
            >
                <Column
                    header="#"
                    body={(_, opts) =>
                        (pagination.current - 1) * pagination.pageSize + opts.rowIndex + 1
                    }
                    style={{ width: 50 }}
                    frozen
                />
                <Column field="year" header="Он" style={{ width: 80 }} frozen />
                <Column
                    field="month"
                    header="Сар"
                    style={{ width: 90 }}
                    body={(row) => `${row.month}-р сар`}
                    frozen
                />
                {products.slice(0, 4).map((p) => (
                    <Column
                        key={p.code}
                        field={p.code}
                        header={p.name.split(",")[0]}
                        style={{ minWidth: 100 }}
                        body={(row) => formatPrice(row[p.code])}
                    />
                ))}
                <Column
                    header="Бусад"
                    style={{ minWidth: 80 }}
                    body={(row) => {
                        const filled = products.filter(
                            (p) => row[p.code] != null && Number.isFinite(Number(row[p.code]))
                        ).length;
                        return `${filled}/${products.length}`;
                    }}
                />
                <Column header="Үйлдэл" body={actionBody} style={{ width: 120 }} frozen alignFrozen="right" />
            </DataTable>

            <Modal
                title={editingKey ? `Засварлах — ${editingKey}` : "Шинэ үнийн мөр нэмэх"}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingKey(null);
                }}
                footer={null}
                width={1000}
                styles={{ body: { maxHeight: "80vh", overflowY: "auto" } }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <div className="grid grid-cols-2 gap-3 p-2">
                        <Form.Item
                            name="year"
                            label="Он"
                            rules={[{ required: true, message: "Он сонгоно уу" }]}
                        >
                            <Select
                                options={yearOptions}
                                placeholder="Он"
                                disabled={Boolean(editingKey)}
                                showSearch
                            />
                        </Form.Item>
                        <Form.Item
                            name="month"
                            label="Сар"
                            rules={[{ required: true, message: "Сар сонгоно уу" }]}
                        >
                            <Select
                                options={MONTH_OPTIONS}
                                placeholder="Сар"
                                disabled={Boolean(editingKey)}
                            />
                        </Form.Item>
                    </div>

                    <p className="mb-3 text-sm font-medium text-gray-600">
                        Бүтээгдэхүүний үнэ (төгрөг)
                    </p>
                    <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2 p-2">
                        {products.map((p) => (
                            <Form.Item
                                key={p.code}
                                name={p.code}
                                label={p.name}
                                className="mb-2"
                            >
                                <InputNumber
                                    className="w-full"
                                    min={0}
                                    step={1}
                                    placeholder="Үнэ"
                                    controls={false}
                                />
                            </Form.Item>
                        ))}
                    </div>

                    <Form.Item className="mb-0 mt-4 text-right">
                        <Button
                            className="mr-2"
                            onClick={() => {
                                setModalVisible(false);
                                form.resetFields();
                                setEditingKey(null);
                            }}
                        >
                            Болих
                        </Button>
                        <Button type="primary" htmlType="submit" loading={saving}>
                            Хадгалах
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
