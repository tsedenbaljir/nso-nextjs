"use client"
import React from 'react';
import { Form, Input, Button } from 'antd';
import InputItems from '../Edits/UploadImages/InputItems';

const NewsForm = ({ onFinish, initialValues }) => {
    return (
        <Form
            layout="vertical"
            onFinish={onFinish}
            initialValues={initialValues}
        >
            <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: 'Please input title!' }]}
            >
                <Input />
            </Form.Item>

            <InputItems
                name="image"
                label="Cover Image"
                rules={[{ required: true, message: 'Please upload an image!' }]}
            />

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};

export default NewsForm; 