"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TabView, TabPanel } from 'primereact/tabview';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import DisseminationTable from '@/components/admin/dissemination/DisseminationTable';

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function Dissemination() {
    const router = useRouter()
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchArticles()
    }, [])

    const handleUnauthorized = () => {
        router.push('/auth/signin')
    }

    const fetchArticles = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/dissemination/admin', {
                cache: 'no-store'
            })
            if (response.status === 401) {
                handleUnauthorized()
                return
            }
            const data = await response.json()
            if (data.status) {
                const latestNews = data.data.filter(article => article.news_type === 'LATEST')
                const futureNews = data.data.filter(article => article.news_type === 'FUTURE')
                setArticles({ latest: latestNews, future: futureNews })
            }
        } catch (error) {
            console.error('Error fetching articles:', error)
        } finally {
            setLoading(false)
        }
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
                    const response = await fetch(`/api/dissemination/admin/${id}`, {
                        method: 'DELETE',
                    });

                    if (response.status === 401) {
                        handleUnauthorized();
                        return;
                    }

                    const data = await response.json();
                    
                    if (data.status) {
                        fetchArticles(); // Refresh the list after successful deletion
                        alert('Мэдээ амжилттай устгагдлаа');
                    } else {
                        throw new Error(data.message || 'Delete failed');
                    }
                } catch (error) {
                    console.error('Error deleting article:', error);
                    alert('Мэдээ устгахад алдаа гарлаа!');
                }
            }
        });
    };

    const handleEdit = (id) => {
        router.push(`/admin/dissemination/edit/${id}`);
    };

    const statusBodyTemplate = (rowData) => {
        return (
            <button className={`px-2 py-1 text-xs rounded-md text-white ${
                rowData.published ? 'bg-emerald-500' : 'bg-yellow-500'
            }`}>
                {rowData.published ? 'Идэвхтэй' : 'Идэвхгүй'}
            </button>
        )
    }

    const languageBodyTemplate = (rowData) => {
        return (
            <img
                src={rowData.language === 'MN' ? '/images/flag_MN.png' : '/images/flag_EN.png'}
                alt={rowData.language}
                className="w-5 h-4"
            />
        )
    }

    const dateBodyTemplate = (rowData, field) => {
        try {
            return rowData[field]?.substr(0, 10) || 'Date not available'
        } catch (error) {
            return 'Date not available'
        }
    }

    return (
            <div className="w-full card">
                <ConfirmDialog />
                <TabView>
                    <TabPanel header="Сүүлд гарсан">
                        <DisseminationTable 
                            data={articles.latest}
                            loading={loading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            languageBodyTemplate={languageBodyTemplate}
                            statusBodyTemplate={statusBodyTemplate}
                            dateBodyTemplate={dateBodyTemplate}
                        />
                    </TabPanel>
                    <TabPanel header="Удахгүй гарах">
                        <DisseminationTable 
                            data={articles.future}
                            loading={loading}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            languageBodyTemplate={languageBodyTemplate}
                            statusBodyTemplate={statusBodyTemplate}
                            dateBodyTemplate={dateBodyTemplate}
                        />
                    </TabPanel>
                </TabView>
            </div>
    )
}
