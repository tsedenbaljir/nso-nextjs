"use client"
import { useState, useEffect } from 'react'
import { useTranslation } from '@/app/i18n/client'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation'
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';

import "primereact/resources/themes/lara-light-indigo/theme.css"
import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"

export default function AllNews({ params: { lng } }) {
    const router = useRouter()
    const { t } = useTranslation(lng)
    const [articles, setArticles] = useState([])
    const [sector_types, setTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { value: null, matchMode: FilterMatchMode.CONTAINS },
        news_type: { value: null, matchMode: FilterMatchMode.EQUALS }
    });

    useEffect(() => {
        async function data() {
            const response = await fetch('/api/subsectorlist', {
                cache: 'no-store'
            });
            const sectors = await response.json();
            const allSubsectors = {};

            for (const sector of sectors.data) {
                allSubsectors[sector.id] = sector.sector + " - " + sector.text;
            }
            setTypes(allSubsectors)
        }
        data();
        fetchArticles()
    }, [])

    const handleUnauthorized = () => {
        router.push('/auth/signin') // Redirect to login page
    }

    const fetchArticles = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/methodology/admin', {
                cache: 'no-store'
            })
            if (response.status === 401) {
                handleUnauthorized()
                return
            }
            const data = await response.json()
            setArticles(data.data)
        } catch (error) {
            console.error('Error fetching articles:', error)
        } finally {
            setLoading(false)
        }
    }

    // Template for status column
    const statusBodyTemplate = (rowData) => {
        return (
            <button
                className={`px-2 py-1 text-xs rounded-md text-white ${rowData.published
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

    const dataNewsType = (rowData) => {
        // Check if sector_types is loaded and has the mapping
        if (sector_types && Object.keys(sector_types).length > 0) {
            return sector_types[rowData.sector_type] || `ID: ${rowData.sector_type}`;
        }
        // Fallback while loading
        return rowData.sector_type || 'Ачаалж байна...';
    };

    // Add this template for the index column
    const indexBodyTemplate = (rowData, options) => {
        return options.rowIndex + 1;
    };

    const handleDelete = async (id) => {
        confirmDialog({
            message: 'Энэ мэдээг устгахдаа итгэлтэй байна уу?',
            header: 'Устгах',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Тийм',
            rejectLabel: 'Үгүй',
            accept: async () => {
                try {
                    const response = await fetch(`/api/methodology/admin`, {
                        method: 'DELETE',
                        body: JSON.stringify({ id: id })
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
            <>
                <div className="flex gap-2">
                    <Button
                        icon="pi pi-pencil"
                        rounded
                        outlined
                        className="mr-2"
                        onClick={() =>
                            router.push(`/admin/methodology/edit/${rowData.id}`)
                        }
                    />
                    <Button
                        icon="pi pi-trash"
                        rounded
                        outlined
                        severity="danger"
                        onClick={() => handleDelete(rowData.id)}
                    />
                </div>
            </>
        );
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center">
                <h5 className="m-0">Мэдээ мэдээлэл</h5>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilterValue}
                        onChange={onGlobalFilterChange}
                        placeholder="Хайх..."
                    />
                </span>
            </div>
        );
    };

    return (
        <div className="w-full card">
            <ConfirmDialog />
            <DataTable
                value={articles}
                dataKey="id"
                paginator
                rows={15}
                selectionMode="single"
                rowsPerPageOptions={[15]}
                className="p-datatable-sm cursor-pointer"
                emptyMessage="No articles found."
                currentPageReportTemplate="Нийт {totalRecords} мэдээллээс {first}-{last}"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                loading={loading}
                loadingIcon={() => (
                    <div className="flex justify-center items-center h-32">
                        <ProgressSpinner
                            style={{ width: '50px', height: '50px' }}
                            strokeWidth="4"
                            animationDuration=".5s"
                        />
                    </div>
                )}
                header={renderHeader}
                filters={filters}
                globalFilterFields={['name']}
            >
                <Column
                    header="#"
                    body={indexBodyTemplate}
                    style={{ width: '3rem' }}
                />
                <Column
                    field="name"
                    header="Гарчиг"
                    filter
                    filterPlaceholder="Хайх..."
                    style={{ maxWidth: '300px', whiteSpace: 'normal' }}
                    body={(rowData) => (
                        <div className="whitespace-normal line-clamp-2" title={rowData.name}>
                            {rowData.name}
                        </div>
                    )}
                />
                <Column
                    field="sector_type"
                    header="Статистикийн ангилал"
                    style={{ maxWidth: '200px', whiteSpace: 'normal' }}
                    body={dataNewsType}
                />
                <Column
                    field="language"
                    header="Хэл"
                    body={languageBodyTemplate}
                    style={{ width: '5rem' }}
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
                {/* <Column
                    field="last_modified_by"
                    header="Өөрчилсөн хэрэглэгч"
                    style={{ width: '8rem' }}
                /> */}
                <Column
                    header="Үйлдэл"
                    body={actionBodyTemplate}
                    style={{ width: '6rem' }}
                />
            </DataTable>
        </div>
    )
}
