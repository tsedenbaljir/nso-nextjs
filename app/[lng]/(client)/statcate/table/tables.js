"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";

export default function Table({ sector, subsector, lng }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch data for DataTable
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/sectortablename?sector=${decodeURIComponent(sector)}&subsector=${decodeURIComponent(subsector)}&lng=${lng}`);
                const response = await res.json();
                // Format API data for DataTable
                const formattedData = response.data.map((item, index) => ({
                    id: index + 1,
                    link: item.id,
                    name: item.text,
                    date: item.updated,
                    category: item.type === "t" ? "Текст" : "Бусад"
                }));

                setData(formattedData);
            } catch (err) {
                console.log("Failed to fetch data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sector, subsector]);

    return (
        <div className="bg-white">
            <DataTable
                value={data}
                paginator
                rows={10}
                // rowsPerPageOptions={[10, 25, 50]} 
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
                        //<Link href={`${process.env.BASE_FRONT_URL}/pxweb/mn/NSO/NSO__${sector}__${subsector}/` + rowData.link}
                        <Link href={`/${lng}/statcate/table-view/${sector}/${subsector}/${rowData.link}`}
                            className="hover:text-blue-700 hover:underline text-gray-900 font-medium">
                            {rowData.name}
                        </Link>
                    )}
                />
                <Column
                    field="date"
                    header="Шинэчлэгдсэн огноо"
                    sortable
                    className="nso_table_col"
                    body={(rowData) => (
                        <span className="hover:text-blue-700 hover:underline text-blue-400 font-medium">
                            {rowData.date.substr(0, 10)}
                        </span>
                    )}
                />
            </DataTable>
        </div>
    );
}
