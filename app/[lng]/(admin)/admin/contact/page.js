"use client"
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Form, Input, Select, message } from 'antd';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';

const { TextArea } = Input;
const { Option } = Select;

export default function ContactAdmin({ params: { lng } }) {
    const { t } = useTranslation(lng);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const indexBodyTemplate = (rowData, props) => {
        return props.rowIndex + 1;
    };

    const fetchData = async (page = 1, pageSize = 10) => {
        try {
            const response = await fetch(`/api/contact?page=${page - 1}&pageSize=${pageSize}`);
            const result = await response.json();
            const contactList = Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
            setData(contactList.map((item, index) => ({
                ...item,
                id: (page - 1) * pageSize + index + 1
            })));
    
            setPagination(prev => ({
                ...prev,
                total: result.pagination?.total || contactList.length,
                current: page,
                pageSize: pageSize
            }));            
    
        } catch (error) {
            console.error('Error fetching glossary:', error);
            message.error('Алдаа гарлаа');
        } finally {
            setLoading(false);
        }
    };    

    useEffect(() => {
        fetchData();
    }, []);
    
    const onPage = (event) => {
        fetchData(event.page + 1, event.rows);
    };

    return (
        <div className="">
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
            >
                <Column field="id" header="ID" style={{ width: '3%' }} />
                <Column field="last_name" header="Овог" style={{ width: '8%' }} />
                <Column field="first_name" header="Нэр" style={{ width: '8%' }} />
                <Column field="country" header="Улс" style={{ width: '8%' }} />
                <Column field="city" header="Хот" style={{ width: '8%' }} />
                <Column field="khoroo" header="Хороо" style={{ width: '8%' }} />
                <Column field="district" header="Дүүрэг" style={{ width: '8%' }} />
                <Column field="phone_number" header="Утас" style={{ width: '8%' }} />
                <Column field="created_date" header="Огноо" body={(rowData) => new Date(rowData.created_date).toLocaleDateString()} style={{ width: '8%' }} />
                <Column field="letter" header="Захидал" style={{ width: '30%' }} />
            </DataTable>
        </div>
    );
} 