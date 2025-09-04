"use client"
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, Modal, Space, Table, message } from 'antd';
import Link from 'next/link';
import axios from 'axios';

export default function MetadataAdmin() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    const fetchData = async (pg = page, ps = pageSize) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/metadata/admin?page=${pg - 1}&pageSize=${ps}`);
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

    const columns = useMemo(() => [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: 'Нэр (MN)', dataIndex: 'labelmn' },
        { title: 'Нэр (EN)', dataIndex: 'labelen' },
        { title: 'Сүүлд өөрчлөгдсөн', dataIndex: 'last_modified_date', width: 200 },
        {
            title: 'Үйлдэл',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Link href={`/admin/metadata/${record.id}`}><Button size="small">Засах</Button></Link>
                </Space>
            )
        }
    ], []);

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <div className="mb-4 flex justify-between">
                <h2 className="text-lg font-medium">Мета өгөгдөл</h2>
                <Button type="primary" onClick={handleAdd}>Шинэ нэмэх</Button>
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
                        fetchData(p, ps);
                    }
                }}
            />

            {/* modal removed; navigation to new/edit pages */}
        </div>
    );
}


