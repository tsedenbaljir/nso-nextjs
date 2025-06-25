"use client";
import { useEffect, useState } from "react";
import Image from 'next/image';
import { Column } from "primereact/column";
import { useRouter } from "next/navigation";
import { DataTable } from "primereact/datatable";

export default function Main({ sector, subsector, lng }) {

    const router = useRouter();
    // Set initial active tab
    const [data, setData] = useState([]); // Store API data
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch subcategories
        const fetchSubcategories = async () => {
            try {
                const response = await fetch(`/api/download?info=${subsector}&lng=${lng}&type=reportSector`);
                const result = await response.json();

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
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport PageLinks NextPageLink LastPageLink "
                currentPageReportTemplate={`Нийт: {totalRecords}`}
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
                        <div onClick={() => {
                            const filePath = JSON.parse(rowData.file_info)?.pathName;
                            if (filePath) {
                                window.open(`${process.env.FRONTEND}/uploads/images/${filePath}`, "_blank");
                            }
                        }}
                            className="hover:text-blue-700 hover:underline text-gray-900 font-medium text-nowrap cursor-pointer">
                            {rowData.name}
                        </div>
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
                        <div onClick={() => {
                            const filePath = JSON.parse(rowData.file_info)?.pathName;
                            if (filePath) {
                                window.open(`${process.env.FRONTEND}/uploads/images/${filePath}`, "_blank");
                            }
                        }}
                            className="hover:text-blue-700 hover:underline text-red-300 font-medium text-nowrap text-center cursor-pointer">
                            <Image src="/images/file-download.png" width={15} height={15} className='float-left mt-1' alt='file-download' /> PDF
                        </div>
                    )}
                />
            </DataTable>
        </div>
    );
}
