"use client"
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, Space, Table, message } from 'antd';
import Link from 'next/link';
import axios from 'axios';

const { Search } = Input;

export default function MetadataAdmin() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);
    const [searchText, setSearchText] = useState("");

    const fetchData = async (pg = page, ps = pageSize, q = searchText) => {
        setLoading(true);
        try {
            const res = await axios.get(
                `/api/metadata/admin?page=${pg - 1}&pageSize=${ps}&q=${encodeURIComponent(q)}`
            );
            setData(res.data?.data || []);
            if (res.data?.pagination) {
                setTotal(res.data.pagination.total || 0);
            }
        } catch (e) {
            message.error('Алдаа гарлаа');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        window.location.href = '/admin/metadata/new';
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setPage(1); // эхнээс нь хайна
        fetchData(1, pageSize, value);
    };

    const columns = useMemo(() => [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: 'Нэр (MN)', dataIndex: 'namemn' },
        { title: 'Нэр (EN)', dataIndex: 'nameen' },
        { title: 'Төрөл', dataIndex: 'type' },
        { title: 'Хувилбар', dataIndex: 'version' },
        { title: 'Үүсгэсэн огноо', dataIndex: 'created_date' },
        { title: 'Өөрчилсөн огноо', dataIndex: 'last_modified_date', width: 200 },
        { title: 'Идэвхтэй эсэх', dataIndex: 'active' },
        { title: 'Өөрчилсөн хэрэглэгч', dataIndex: 'last_modified_by' },
        {
            title: 'Үйлдэл',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Link href={`/admin/metadata/${record.id}`}>
                        <Button size="small">Засах</Button>
                    </Link>
                </Space>
            )
        }
    ], []);

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-medium">Мета өгөгдөл</h2>
                <div className="flex gap-2">
                    <Search
                        placeholder="Нэрээр хайх..."
                        onSearch={handleSearch}
                        allowClear
                        style={{ width: 250 }}
                    />
                    {/* <Button type="primary" onClick={handleAdd}>Шинэ нэмэх</Button> */}
                </div>
            </div>
            <Table
                rowKey={(r) => r.id + '_' + (r.meta_id || 'x')}
                dataSource={data}
                columns={columns}
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    onChange: (p, ps) => {
                        setPage(p);
                        setPageSize(ps);
                        fetchData(p, ps, searchText);
                    }
                }}
            />
        </div>
    );
}
