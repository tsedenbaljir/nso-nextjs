"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Modal, Form, Input, Space, Popconfirm, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { fetchAdminUsers, createAdminUser, deleteAdminUser } from "@/app/services/actions";

export default function UserManagementPage() {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const columns = useMemo(() => [
        { title: "ID", dataIndex: "id", key: "id", width: 80 },
        { title: "Username", dataIndex: "username", key: "username" },
        { title: "Roles", dataIndex: "Roles", key: "Roles" },
        {
            title: "Actions",
            key: "actions",
            width: 140,
            render: (_, record) => (
                <Space>
                    <Popconfirm
                        title="Delete user"
                        description={`Are you sure to delete ${record.username}?`}
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button danger size="small">Delete</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ], []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const json = await fetchAdminUsers();
            if (!json?.success) throw new Error(json?.error || "Failed to load users");
            setUsers(Array.isArray(json.data) ? json.data : []);
        } catch (err) {
            console.error(err);
            message.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const json = await deleteAdminUser(id);
            if (!json?.success) throw new Error(json?.error || "Failed to delete user");
            message.success("User deleted");
            await fetchUsers();
        } catch (err) {
            console.error(err);
            message.error("Delete failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const json = await createAdminUser({
                username: values.username,
                password: values.password,
                role: values.role,
            });
            if (!json?.success) throw new Error(json?.error || "Failed to create user");
            message.success("User created");
            setIsModalOpen(false);
            await fetchUsers();
        } catch (err) {
            if (err?.errorFields) return; // antd validation
            console.error(err);
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-lg font-semibold">Хэрэглэгчийн удирдлага</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Хэрэглэгч нэмэх</Button>
            </div>

            <Table
                rowKey="id"
                loading={loading}
                dataSource={users}
                columns={columns}
                pagination={{ pageSize: 20 }}
                bordered
                size="middle"
            />

            <Modal
                title="Add user"
                open={isModalOpen}
                onOk={handleCreate}
                onCancel={() => setIsModalOpen(false)}
                okText="Create"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="username" label="Хэрэглэгчийн нэр" rules={[{ required: true, message: "Хэрэглэгчийн нэр оруулна уу" }]}>
                        <Input placeholder="username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Нууц үг"
                        rules={[
                            { required: true, message: "Нууц үг оруулна уу" },
                            { min: 6, message: "6-аас дээш тэмдэгтээр оруулна уу" },
                        ]}
                    >
                        <Input.Password placeholder="Нууц үг" />
                    </Form.Item>
                    <Form.Item name="role" label="Хэрэглэгчийн түвшин">
                        <Input placeholder="admin, laws, transparency, metadata-questionnaire." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}


