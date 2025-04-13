"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingDiv from '@/components/Loading/Text/Index';
import styles from './styles.module.scss';

export default function SurveyMaterials({ params }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/data-visualisation/downloads?data_viz_id=${params.id}`);
                if (!response.ok) throw new Error("Failed to fetch data");

                const results = await response.json();
                const transformedData = transformDownloadData(results);
                setData(transformedData);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
        if (!JSON.parse(fileInfo).pathName) return;
        router.push(`https://gateway.1212.mn/services/fms/api/public/download/0/${JSON.parse(fileInfo)?.pathName}`);
    };

    const renderDownloadButton = (rowData, level) => {
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

    // Pagination
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    if (loading) return <div className={styles.loading}><LoadingDiv /></div>;
    if (error) return <p className={styles.error}>Алдаа гарсан байна. Та түр хүлээнэ үү.</p>;

    return (
        <div className="nso_container">
            {data.length > 0 ? (
                <>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: '50%' }}>Нэр</th>
                                    <th style={{ width: '100px' }}>1-р үе</th>
                                    <th style={{ width: '100px' }}>2-р үе</th>
                                    <th style={{ width: '100px' }}>3-р үе</th>
                                    <th style={{ width: '100px' }}>4-р үе</th>
                                    <th style={{ width: '15%' }}>Багцалсан</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.name}</td>
                                        <td className={styles.downloadCell}>{renderDownloadButton(row, 1)}</td>
                                        <td className={styles.downloadCell}>{renderDownloadButton(row, 2)}</td>
                                        <td className={styles.downloadCell}>{renderDownloadButton(row, 3)}</td>
                                        <td className={styles.downloadCell}>{renderDownloadButton(row, 4)}</td>
                                        <td className={styles.downloadCell}>{renderDownloadButton(row, 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <span className={styles.total}>Нийт: {data.length}</span>
                            <div className={styles.pageButtons}>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`${styles.pageButton} ${currentPage === page ? styles.active : ''}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className={styles.noData}>Одоогоор мэдээлэл байхгүй байна.</div>
            )}
        </div>
    );
}
