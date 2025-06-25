'use client';
import { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import ClientStyles from './ClientStyles';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import { DataTable } from 'primereact/datatable';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

export default function AdminTransparency() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLang, setSelectedLang] = useState('mn');
    const router = useRouter();
    const toast = useRef(null);

    useEffect(() => {
        fetchItems();
    }, [selectedLang]);

    const fetchItems = async () => {
        try {
            const response = await fetch(`/api/transparency/admin`, {
                cache: 'no-store'
            });
            const result = await response.json();
            if (result.status && Array.isArray(result.data)) {
                setItems(result.data);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            showError('Error fetching items');
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (message) => {
        toast.current.show({
            severity: 'success',
            summary: 'Амжилттай',
            detail: message,
            life: 3000
        });
    };

    const showError = (message) => {
        toast.current.show({
            severity: 'error',
            summary: 'Алдаа',
            detail: message,
            life: 3000
        });
    };

    const confirmDelete = (id) => {
        confirmDialog({
            message: 'Та энэ мэдээллийг устгахдаа итгэлтэй байна уу?',
            header: 'Устгах',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Тийм',
            rejectLabel: 'Үгүй',
            accept: () => handleDelete(id),
            reject: () => { }
        });
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`/api/transparency?id=${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();
            if (result.status) {
                fetchItems();
                showSuccess('Амжилттай устгагдлаа');
            } else {
                showError('Устгахад алдаа гарлаа');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            showError('Устгахад алдаа гарлаа');
        }
    };

    const actionTemplate = (rowData) => {
        return (
            <div className={styles.actions}>
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="mr-2"
                    onClick={() => router.push(`/mn/admin/transparency/${rowData.id}`)}
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
        return rowData.created_date ? rowData.created_date.substring(0, 10) : '';
    };

    const languageBodyTemplate = (rowData) => {
        return (
            <img
                src={rowData.lng === 'mn' ? '/images/flag_MN.png' : '/images/flag_EN.png'}
                alt={rowData.lng}
                className="h-5"
            />
        )
    }
    return (
        <>
            <ClientStyles />
            <Toast ref={toast} />
            <ConfirmDialog />
            <div className={styles.container}>
                <DataTable
                    value={items}
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    className={styles.table}
                    emptyMessage="Мэдээлэл олдсонгүй"
                >
                    <Column field="title" header="Гарчиг" sortable />
                    <Column field="category" header="Ангилал" sortable />
                    <Column field="lng" header="Хэл" body={languageBodyTemplate} />
                    <Column
                        field="created_date"
                        header="Үүсгэсэн огноо"
                        body={dateBodyTemplate}
                        sortable
                    />
                    <Column body={actionTemplate} header="Үйлдэл" style={{ width: '120px' }} />
                </DataTable>
            </div>
        </>
    );
} 