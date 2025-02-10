"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import LoadingDiv from '@/components/Loading/Text/Index';

export default function Main({ sector, subsector, lng }) {

    // Set initial active tab
    const [data, setData] = useState([]); // Store API data
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch subcategories
        const fetchSubcategories = async () => {
            try {
                const response = await fetch(`/api/methodology?info=${subsector}&lng=${lng}`);
                const result = await response.json();
                console.log(result);

                setData(result.data)
                if (!Array.isArray(result.data)) {
                    return [];
                }
            } catch (error) {
                return [];
            } finally {
                setLoading(false);
            }
        };
        fetchSubcategories();
    }, [sector, subsector]);

    return (
        <div className="bg-white">
            <DataTable
                value={data}
                paginator
                rows={10}
                className="nso_table"
                loading={loading}
            >
                <Column
                    field="id"
                    header="No."
                    className="nso_table_col"
                    body={(rowData, { rowIndex }) => (
                        <span className="hover:text-blue-700 hover:underline text-blue-400 font-bold">
                            {rowIndex + 1}
                        </span>
                    )}
                />
                <Column
                    field="name"
                    header="Нэр"
                    sortable
                    className="nso_table_col"
                    body={(rowData) => (
                        <Link href={`https://downloads.1212.mn/${JSON.parse(rowData.file_info)?.pathName}`}
                            className="hover:text-blue-700 hover:underline text-gray-900 font-medium text-nowrap">
                            {rowData.name}
                        </Link>
                    )}
                />
                <Column
                    field="file_size"
                    header="Файлын хэмжээ"
                    sortable
                    className="nso_table_col"
                    body={(rowData) => (
                        <span className="hover:text-blue-700 hover:underline text-blue-400 font-bold">
                            {(() => {
                                try {
                                    const fileSize = JSON.parse(rowData.file_info)?.fileSize; // Extract file size
                                    if (!fileSize) return "N/A"; // Handle missing data

                                    if (fileSize >= 1024 * 1024) {
                                        return (fileSize / 1024 / 1024).toFixed(1) + " MB"; // Convert to MB if >= 1MB
                                    } else {
                                        return (fileSize / 1024).toFixed(2) + " kB"; // Convert to KB if < 1MB
                                    }
                                } catch {
                                    return "N/A"; // Handle JSON parsing errors
                                }
                            })()}
                        </span>
                    )}
                />
                <Column
                    field="date"
                    header="Шинэчлэгдсэн огноо"
                    sortable
                    className="nso_table_col"
                    body={(rowData) => (
                        <span className="text-black font-normal">
                            {rowData.created_date.substr(0, 10)}
                        </span>
                    )}
                />
                <Column
                    field="views"
                    header="Татсан тоо"
                    sortable
                    className="nso_table_col"
                    body={(rowData) => (
                        <span className="text-black font-normal">
                            {new Intl.NumberFormat("en-US").format(rowData.views)}
                        </span>
                    )}
                />
                <Column
                    field="download"
                    header="Татах"
                    className="nso_table_col"
                    body={(rowData) => (
                        <Link href={`https://downloads.1212.mn/${JSON.parse(rowData.file_info)?.pathName}`}
                            className="hover:text-blue-700 hover:underline text-red-300 font-medium text-nowrap">
                            PDF
                        </Link>
                    )}
                />
            </DataTable>
        </div>
    );
}
