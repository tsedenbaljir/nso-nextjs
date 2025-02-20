"use client";
import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Tabs({ lng, type }) {
    const [menuItems, setMenuItems] = useState([]); // Stores categories & subcategories
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ total: 0, first: 0, rows: 10 });
    const router = useRouter();

    useEffect(() => {
        const fetchSubcategories = async () => {
            try {
                const response = await fetch(`/api/file-library?lng=${lng}&type=${type}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const result = await response.json();

                if (Array.isArray(result.data)) {
                    setMenuItems(result.data);
                    setPagination((prev) => ({ ...prev, total: result.data.length }));
                } else {
                    setMenuItems([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchSubcategories();
    }, [lng, type]);

    // Function to check if file is a PDF
    const getCheckItemExtension = (item, extension) => {
        return item.name.toLowerCase().endsWith(`.${extension}`);
    };

    // Function to handle file download
    const onDownloadDirect = async (fileInfo) => {
        const url = `https://downloads.1212.mn/${JSON.parse(fileInfo).pathName}`;
        window.open(url, "_blank"); 
    };
    

    // Function to get file extension
    const getExtension = (file_info) => {
        try {
            const fileInfo = file_info ? JSON.parse(file_info) : null;
            return fileInfo?.extension ? fileInfo.extension.toUpperCase() : "N/A"; // Handle missing extension
        } catch (error) {
            console.error("Error parsing fileInfo:", error);
            return "N/A"; // Fallback if JSON is invalid
        }
    };
    

    // Pagination Handler
    const onPageChange = (event) => {
        setPagination({
            ...pagination,
            first: event.first,
            rows: event.rows,
        });
    };

    return (
        <div id="stat_cate" className="nso_cate_body">
            <div className="nso_tab_content">
                <div className="nso_tab">
                    <div className="__table_desktop">
                        <div className="__sector_list">
                            <span className="__sector_header">
                                Бүх файл
                            </span>
                            <div className="__table">
                                {/* PrimeReact DataTable */}
                                <DataTable
                                    value={menuItems.slice(pagination.first, pagination.first + pagination.rows)}
                                    loading={loading}
                                    paginator={false} // We use external paginator
                                >
                                    <Column
                                        body={(item) => (
                                            <div className="__file_table">
                                                {/* Conditional Link or Clickable Div */}
                                                {getCheckItemExtension(item, "pdf") ? (
                                                    <Link href={`/view/${item.id}`} className="_file_name">
                                                        {item.name}
                                                    </Link>
                                                ) : (
                                                    <div className="_file_name" onClick={() => onDownloadDirect(item.file_info)}>
                                                        {item.name}
                                                    </div>
                                                )}

                                                <div className="_file_info">{item.info}</div>

                                                {/* Footer Section */}
                                                <div className="__file_table_foot">
                                                    <div className="_file_publishedDate">
                                                        {new Date(item.published_date).toISOString().split("T")[0]}
                                                    </div>
                                                    <div className="_file_view">
                                                        <i className="pi pi-eye"></i> {item.views.toLocaleString()}
                                                    </div>
                                                    <div className="_file_type">
                                                        <span>{getExtension(item.file_info)}</span>
                                                    </div>
                                                    <div className="_file_size">
                                                        {lng === "mn" ? "Файлын хэмжээ:" : "File Size:"} {(item.file_size / 1024 / 1024).toFixed(2)} MB
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    />
                                </DataTable>

                                {/* Custom Pagination */}
                                <div className="__pagination">
                                    <span>
                                        {lng === "mn" ? "Нийт:" : "A total of:"} <strong>{pagination.total}</strong>
                                    </span>
                                    <Paginator
                                        first={pagination.first}
                                        rows={pagination.rows}
                                        totalRecords={pagination.total}
                                        onPageChange={onPageChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
