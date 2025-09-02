"use client"
import React from 'react';
import { Button, Form, Input, message } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function MetadataNew() {
    const [form] = Form.useForm();
    const router = useRouter();

    const onFinish = async (values) => {
        try {
            await axios.post('/api/metadata/admin', { ...values, metaValues: [] });
            message.success('Амжилттай бүртгэлээ');
            router.push('/admin/metadata');
        } catch (e) {
            message.error('Алдаа гарлаа');
        }
    };

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <div className="mb-4 flex justify-between">
                <h2 className="text-lg font-medium">Мета өгөгдөл шинээр нэмэх</h2>
            </div>
            <Form layout="vertical" form={form} onFinish={onFinish}>
                <Form.Item name="namemn" label="Нэр (MN)" rules={[{ required: true, message: 'Заавал' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="nameen" label="Нэр (EN)" rules={[{ required: true, message: 'Заавал' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="descriptionmn" label="Тайлбар (MN)">
                    <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="descriptionen" label="Тайлбар (EN)">
                    <Input.TextArea rows={3} />
                </Form.Item>
                <Button type="primary" htmlType="submit">Хадгалах</Button>
            </Form>
        </div>
    );
}


