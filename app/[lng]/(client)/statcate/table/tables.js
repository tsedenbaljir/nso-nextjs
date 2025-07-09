"use client";

import { useEffect, useState } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import nameBodyTemplate from "./body";
import dateBodyTemplate from "./date";

export default function Table({ sector, subsector, lng }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null); // Only one row expanded at a time

    // Fetch subtables for non-px items
    const subFetch = async (rowLink) => {
        const res = await fetch(`/api/sectortablename/subtable?sector=${decodeURIComponent(sector)}&subsector=${decodeURIComponent(subsector)}&subtables=${decodeURIComponent(rowLink)}&lng=${lng}`, {
            cache: "no-store",
        });
        const response = await res.json();
        return response.data.map((item, index) => ({
            id: index + 1,
            link: item.id,
            name: item.text,
            date: item.updated,
            category: item.type === "t" ? "Текст" : "Бусад",
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/sectortablename?sector=${decodeURIComponent(sector)}&subsector=${decodeURIComponent(subsector)}&lng=${lng}`, {
                    cache: "no-store",
                });
                const response = await res.json();

                // Fetch subtables for non-px items
                const formattedData = await Promise.all(
                    response.data.map(async (item, index) => {
                        const isPx = item.id.includes(".px");
                        const sub = !isPx ? await subFetch(item?.id) : null;
                        return {
                            id: index + 1,
                            link: item?.id,
                            name: item?.text,
                            date: item?.updated,
                            sub,
                            category: item?.type === "t" ? "Текст" : "Бусад",
                        };
                    })
                );

                setData(formattedData);
            } catch (err) {
                console.error("Failed to fetch data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sector, subsector, lng]);

    return (
        <div className="bg-white">
            <DataTable
                value={data}
                paginator
                rows={10}
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport PageLinks NextPageLink LastPageLink"
                currentPageReportTemplate={lng === "mn" ? "Нийт: {totalRecords}" : "Total: {totalRecords}"}
                className="nso_table"
                loading={loading}
            >
                {/* No. */}
                <Column
                    field="id"
                    header="No."
                    className="nso_table_col"
                    body={(rowData, { rowIndex }) => (
                        <span className="text-blue-400 font-bold">{rowIndex + 1}</span>
                    )}
                />
                {/* Name + Expansion */}
                <Column
                    field="name"
                    header={lng === "mn" ? "Нэр" : "Name"}
                    sortable
                    className="nso_table_col"
                    body={(rowData) => nameBodyTemplate(rowData, lng, sector, subsector, setExpandedRow)}
                />
                {/* Date */}
                <Column
                    field="date"
                    header={lng === "mn" ? "Шинэчлэгдсэн огноо" : "Updated date"}
                    sortable
                    className="nso_table_col"
                    body={(rowData) => dateBodyTemplate(rowData, expandedRow)}
                />
            </DataTable>
        </div>
    );
}
