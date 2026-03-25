"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingDiv from '@/components/Loading/Text/Index';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import styles from './styles.module.scss';

export default function SurveyMaterials({ params }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lazyState, setLazyState] = useState({
        first: 0,
        rows: 10,
        page: 1,
        totalRecords: 0
    });

    const router = useRouter();

    const loadData = async (page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/data-visualisation/downloads?data_viz_id=${params.id}&page=${page}&pageSize=${pageSize}`);
            if (!response.ok) throw new Error("Failed to fetch data");

            const results = await response.json();
            const transformedData = transformDownloadData(results.data);
            
            setData(transformedData);
            setLazyState(prev => ({
                ...prev,
                totalRecords: results.total || transformedData.length
            }));
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const onPage = (event) => {
        setLazyState(event);
        loadData(event.page + 1, event.rows);
    };

    useEffect(() => {
        loadData(lazyState.page, lazyState.rows);
    }, [params.id]);

    const transformDownloadData = (downloads) => {
        const groupedData = downloads.reduce((acc, item) => {
            if (!acc[item.name]) {
                acc[item.name] = {
                    name: item.name,
                    lvl0: { available: false },
                    lvl1: { available: false },
                    lvl2: { available: false },
                    lvl3: { available: false },
                    lvl4: { available: false }
                };
            }

            const level = item.list_order || 0;
            acc[item.name][`lvl${level}`] = {
                available: true,
                fileInfo: item.file_info,
                fileType: item.file_type
            };

            return acc;
        }, {});

        return Object.values(groupedData);
    };

    const onDownload = (fileInfo) => {
        if (!fileInfo) return;
        try {
            const parsedInfo = JSON.parse(fileInfo);
            if (parsedInfo?.pathName) {
                window.open(`https://gateway.1212.mn/services/fms/api/public/download/0/${parsedInfo.pathName}`, '_blank');
            }
        } catch (error) {
            console.error('Error parsing file info:', error);
        }
    };

    const downloadButtonTemplate = (level) => (rowData) => {
        if (rowData[`lvl${level}`]?.available) {
            const fileType = rowData[`lvl${level}`].fileType?.toUpperCase() || 'PPT';
            return (
                <button 
                    type="button"
                    className={styles.downloadButton}
                    onClick={() => onDownload(rowData[`lvl${level}`].fileInfo)}
                >
                    <img 
                        src="/images/file-download.png" 
                        alt="download"
                        width={20}
                        height={20}
                    />
                    <span>{fileType}</span>
                </button>
            );
        }
        return null;
    };

    if (loading && !data.length) {
        return <div className={styles.loading}><LoadingDiv /></div>;
    }

    return (
        <div className="nso_container">
            <DataTable
                value={data}
                lazy
                paginator
                first={lazyState.first}
                rows={lazyState.rows}
                totalRecords={lazyState.totalRecords}
                onPage={onPage}
                loading={loading}
                className="p-datatable-sm"
                emptyMessage="Одоогоор мэдээлэл байхгүй байна."
                currentPageReportTemplate="Нийт: {totalRecords}"
                showCurrentPageReport
            >
                <Column field="name" header="Нэр" style={{ width: '50%' }} />
                <Column header="1-р үе" body={downloadButtonTemplate(1)} style={{ width: '100px' }} />
                <Column header="2-р үе" body={downloadButtonTemplate(2)} style={{ width: '100px' }} />
                <Column header="3-р үе" body={downloadButtonTemplate(3)} style={{ width: '100px' }} />
                <Column header="4-р үе" body={downloadButtonTemplate(4)} style={{ width: '100px' }} />
                <Column header="Багцалсан" body={downloadButtonTemplate(0)} style={{ width: '15%' }} />
            </DataTable>
        </div>
    );
}
