"use client"
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { Button, Modal, Form, Input, Select, message } from 'antd';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const { TextArea } = Input;
const { Option } = Select;

export default function subscribeEmailAdmin({ params: { lng } }) {
    const { t } = useTranslation(lng);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    });

    const indexBodyTemplate = (rowData, props) => {
        return props.rowIndex + 1;
    };

    const fetchData = async (page = 1, pageSize = 20) => {
        try {
            const response = await fetch(`/api/subscribeEmail?page=${page - 1}&pageSize=${pageSize}`, {
                cache: 'no-store'
            });
            const result = await response.json();
            const emailList = Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
            setData(emailList.map((item, index) => ({
                ...item,
                id: (page - 1) * pageSize + index + 1
            })));
    
            setPagination(prev => ({
                ...prev,
                total: result.pagination?.total || emailList.length,
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
                <Column field="id" header="ID" style={{ width: '5%' }} />
                <Column field="email" header="Цахим шуудан" style={{ width: '80%' }} />
 
            </DataTable>
        </div>
    );
} 