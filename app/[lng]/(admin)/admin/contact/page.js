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
            const response = await fetch(`/api/contact`);
            // const response = await fetch(`/api/contact?page=${page - 1}&pageSize=${pageSize}`);
            const result = await response.json();
            // if (result.status) {
            //     setData(result.data);
            //     setPagination({
            //         ...pagination,
            //         total: result.pagination.total,
            //         current: page,
            //         pageSize: pageSize
            //     });
            // }
            console.log("result", result);
            
        } catch (error) {
            console.error('Error fetching glossary:', error);
            message.error('Алдаа гарлаа');
        } finally {
            setLoading(false);
        }
    };

    const onPage = (event) => {
        fetchData(event.page + 1, event.rows);
        console.log("jjdfjsfshdf");
        
    };

    return (
        <div className="">
            
            {console.log("hfgsdhjh")}
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
                <Column
                    header="#"
                    body={indexBodyTemplate}
                    style={{ width: 20 }}
                />
                <Column field="name" header="Нэр" style={{ width: '40%' }} />
                <Column field="sector_name_mn" header="Ангилал" style={{ width: '10%' }} />
                <Column 
                    field="info" 
                    header="Томьёоны тайлбар" 
                    style={{ width: '25%' }}
                    body={(rowData) => (
                        <div className="truncate max-w-xs" title={rowData.info}>
                            {rowData.info}
                        </div>
                    )}
                />
                <Column 
                    field="published" 
                    header="Төлөв" 
                    style={{ width: '10%' }}
                    // body={publishedBodyTemplate}
                    className="text-center"
                />
                <Column 
                    // body={actionBodyTemplate}
                    header="Үйлдэл"
                    style={{ width: '10%' }}
                />
            </DataTable>
        </div>
    );
} 