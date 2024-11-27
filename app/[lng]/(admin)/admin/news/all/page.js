"use client"
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/layouts/AdminLayout'
import { useTranslation } from '@/app/i18n/client'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { useRouter } from 'next/navigation'
import "primereact/resources/themes/lara-light-indigo/theme.css"
import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';

export default function AllNews({ params: { lng } }) {
    const router = useRouter()
    const { t } = useTranslation(lng)
    const [articles, setArticles] = useState([])

    useEffect(() => {
        fetchArticles()
    }, [])

    const handleUnauthorized = () => {
        router.push('/auth/signin') // Redirect to login page
    }

    const fetchArticles = async () => {
        try {
            const response = await fetch('/api/articles/admin')
            if (response.status === 401) {
                handleUnauthorized()
                return
            }
            const data = await response.json()
            setArticles(data.data)
        } catch (error) {
            console.error('Error fetching articles:', error)
        }
    }

    // Handle row click
    const onRowClick = (event) => {
        router.push(`/admin/news/edit/${event.data.id}`)
    }

    // Template for status column
    const statusBodyTemplate = (rowData) => {
        return (
            <button 
                className={`px-2 py-1 text-xs rounded-md text-white ${
                    rowData.published
                        ? 'bg-emerald-500'
                        : 'bg-yellow-500'
                }`}
            >
                {rowData.published ? 'Идэвхтэй' : 'Идэвхгүй'}
            </button>
        )
    }

    // Template for language column
    const languageBodyTemplate = (rowData) => {
        return (
            <img
                src={rowData.language === 'MN' ? '/images/flag_MN.png' : '/images/flag_EN.png'}
                alt={rowData.language}
                className="w-5 h-4"
            />
        )
    }

    // Template for date columns
    const dateBodyTemplate = (rowData, field) => {
        try {
            return rowData[field]?.substr(0, 10) || 'Date not available'
        } catch (error) {
            return 'Date not available'
        }
    }

    // Add this template for the index column
    const indexBodyTemplate = (rowData, props) => {
        return props.rowIndex + 1;
    }

    const handleDelete = async (id) => {
        confirmDialog({
            message: 'Энэ мэдээг устгахдаа итгэлтэй байна уу?',
            header: 'Устгах',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Тийм',
            rejectLabel: 'Үгүй',
            accept: async () => {
                try {
                    const response = await fetch(`/api/articles/admin/${id}`, {
                        method: 'DELETE',
                    });
                    if (response.status === 401) {
                        handleUnauthorized()
                        return
                    }
                    const data = await response.json();
                    if (data.status) {
                        fetchArticles();
                    }
                } catch (error) {
                    console.error('Error deleting article:', error);
                }
            }
        });
    };

    // Add action column template
    const actionBodyTemplate = (rowData) => {
        return (
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    handleDelete(rowData.id);
                }}
                className="px-2 py-1 text-xs rounded-md text-white bg-red-500 hover:bg-red-600"
            >
                Устгах
            </button>
        );
    };

    return (
        <AdminLayout>
            <div className="w-full card">
                <ConfirmDialog />
                <DataTable
                    value={articles}
                    dataKey="id"
                    paginator
                    rows={15}
                    rowsPerPageOptions={[15]}
                    className="p-datatable-sm cursor-pointer"
                    emptyMessage="No articles found."
                    currentPageReportTemplate="Нийт {totalRecords} мэдээллээс {first}-{last}"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                    onRowClick={onRowClick}
                    selectionMode="single"
                >
                    <Column 
                        header="#"
                        body={indexBodyTemplate}
                        style={{ width: '3rem' }}
                    />
                    <Column 
                        field="name" 
                        header="Гарчиг"
                        sortable
                        style={{ maxWidth: '300px', whiteSpace: 'normal' }}
                        body={(rowData) => (
                            <div className="whitespace-normal line-clamp-2" title={rowData.name}>
                                {rowData.name}
                            </div>
                        )}
                    />
                    <Column 
                        field="language" 
                        header="Хэл"
                        body={languageBodyTemplate}
                        style={{ width: '5rem' }}
                    />
                    <Column 
                        field="published_date" 
                        header="Нийтлэгдсэн огноо"
                        body={(rowData) => dateBodyTemplate(rowData, 'published_date')}
                        sortable
                    />
                    <Column 
                        field="created_date" 
                        header="Хадгалсан огноо"
                        body={(rowData) => dateBodyTemplate(rowData, 'created_date')}
                        sortable
                    />
                    <Column 
                        field="last_modified_date" 
                        header="Өөрчилсөн огноо"
                        body={(rowData) => dateBodyTemplate(rowData, 'last_modified_date')}
                        sortable
                    />
                    <Column 
                        field="published" 
                        header="Төлөв"
                        body={statusBodyTemplate}
                        style={{ width: '7rem' }}
                        sortable
                    />
                    <Column 
                        field="created_by" 
                        header="Үүсгэсэн"
                        style={{ width: '8rem' }}
                    />
                    <Column 
                        header="Үйлдэл"
                        body={actionBodyTemplate}
                        style={{ width: '6rem' }}
                    />
                </DataTable>
            </div>
        </AdminLayout>
    )
}
