"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import { DataTable } from 'primereact/datatable';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import AdminLayout from '@/components/admin/layouts/AdminLayout';

export default function AdminWorkspace({ params: { lng } }) {
    const router = useRouter();
    const toast = useRef(null);
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);

    const locations = [
        { id: "65", name: "Архангай" },
        { id: "83", name: "Баян-Өлгий" },
        { id: "64", name: "Баянхонгор" },
        { id: "63", name: "Булган" },
        { id: "82", name: "Говь-Алтай" },
        { id: "42", name: "Говьсүмбэр" },
        { id: "45", name: "Дархан-Уул" },
        { id: "44", name: "Дорноговь" },
        { id: "21", name: "Дорнод" },
        { id: "48", name: "Дундговь" },
        { id: "81", name: "Завхан" },
        { id: "61", name: "Орхон" },
        { id: "62", name: "Өвөрхангай" },
        { id: "46", name: "Өмнөговь" },
        { id: "22", name: "Сүхбаатар" },
        { id: "43", name: "Сэлэнгэ" },
        { id: "16", name: "Бүгд" },
        { id: "41", name: "Төв" },
        { id: "85", name: "Увс" },
        { id: "84", name: "Ховд" },
        { id: "67", name: "Хөвсгөл" },
        { id: "23", name: "Хэнтий" },
        { id: "11", name: "Улаанбаатар" }
    ];

    const indexBodyTemplate = (rowData, props) => {
        return props.rowIndex + 1;
    };
    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const response = await fetch(`/api/workspace/admin?language=${lng}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const result = await response.json();
            if (result.status) {
                setWorkspaces(result.data);
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id) => {
        confirmDialog({
            message: 'Энэ ажлын байрыг устгахдаа итгэлтэй байна уу?',
            header: 'Устгах',
            icon: 'pi pi-exclamation-triangle',
            accept: () => handleDelete(id),
            acceptLabel: 'Тийм',
            rejectLabel: 'Үгүй'
        });
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/workspace/admin/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.status) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Амжилттай',
                    detail: 'Ажлын байр устгагдлаа'
                });
                fetchWorkspaces();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Алдаа',
                detail: error.message
            });
        }
    };

    const locatoinShow = (rowData) => {
        return (
            <>
                {locations.find(location => location.id === rowData.location)?.name}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="mr-2"
                    onClick={() => router.push(`/${lng}/admin/workspace/edit/${rowData.id}`)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => confirmDelete(rowData.id)}
                />
            </div>
        );
    };

    const dateBodyTemplate = (rowData) => {
        return new Date(rowData.created_date).toLocaleDateString();
    };

    return (
        <AdminLayout lng={lng}>
            <div className="card">
                <Toast ref={toast} />
                <ConfirmDialog />
                <DataTable
                    value={workspaces}
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    emptyMessage={'Мэдээлэл олдсонгүй'}
                >
                <Column
                    header="#"
                    body={indexBodyTemplate}
                    style={{ width: '3rem' }}
                />
                    <Column field="name" header={'Нэр'} sortable />
                    <Column field="location" header={'Байршил'}
                        body={locatoinShow}
                        sortable />
                    <Column field="views" header={'Үзсэн'} sortable />
                    <Column
                        field="created_date"
                        header={'Огноо'}
                        body={dateBodyTemplate}
                        sortable
                    />
                    <Column
                        body={actionBodyTemplate}
                        header={'Үйлдэл'}
                        exportable={false}
                        style={{ minWidth: '12rem' }}
                    />
                </DataTable>
            </div>
        </AdminLayout>
    );
} 