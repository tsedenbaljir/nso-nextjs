"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";

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

    // Name column body
    const nameBodyTemplate = (rowData) => {
        if (!rowData || !rowData.link) return null;
        const isExpanded = expandedRow === rowData.link;
        const hasSub = Array.isArray(rowData.sub) && rowData.sub.length > 0;
        if (!hasSub) {
            return (
                <Link
                    href={`/${lng}/statcate/table-view/${sector}/${subsector}/${rowData.link}`}
                    className="hover:text-blue-700 hover:underline text-gray-900 font-medium"
                >
                    {rowData?.name}
                </Link>
            );
        }
        return (
            <div>
                <span
                    className="-ml-4 flex items-center cursor-pointer text-gray-900 font-medium hover:text-blue-700 hover:underline"
                    onClick={() => {
                        if (!hasSub) return;
                        if (rowData.link === expandedRow) {
                            setExpandedRow(null);
                        } else {
                            setExpandedRow(rowData.link);
                        }
                    }}
                >
                    {isExpanded
                        ? <MinusCircleOutlined className="mr-2" style={{ color: '#1677ff' }} />
                        : <PlusCircleOutlined className="mr-2" style={{ color: '#1677ff' }} />}
                    {rowData?.name}
                    <span className="text-gray-500 text-sm ml-2">( {rowData?.sub?.length} )</span>
                </span>
                {isExpanded && (
                    <div className="ml-7 my-2">
                        {rowData?.sub?.map((item, idx) => (
                            <div key={idx} className="py-2 flex justify-between items-start">
                                <Link
                                    href={`/${lng}/statcate/table-view/${sector}/${subsector}/${item.link}?subtables=${rowData.link}`}
                                    className="hover:text-blue-700 hover:underline text-gray-900 font-medium"
                                >
                                    <span className="pr-1">{idx + 1}.</span> {item?.name}
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Date column body
    const dateBodyTemplate = (rowData) => {
        const isExpanded = expandedRow === rowData.link;
        const subItems = rowData.sub;
        // If expanded and has sub-items, show all sub-item dates
        if (isExpanded && Array.isArray(subItems) && subItems.length > 0) {
            const latest = [...subItems].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            return (
                <div className="text-blue-400 font-medium space-y-1 py-1">
                    <span className="text-blue-400 font-medium">
                        {latest?.date?.substr(0, 10)}
                    </span>
                    {subItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-2">
                            <span>{item?.date?.substr(0, 10)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        // If has sub-items, show latest sub-item date
        if (Array.isArray(subItems) && subItems.length > 0) {
            const latest = [...subItems].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            return (
                <span className="text-blue-400 font-medium">
                    {latest?.date?.substr(0, 10)}
                </span>
            );
        }
        // Otherwise, show row's own date
        return (
            <span className="text-blue-400 font-medium">
                {rowData?.date?.substr(0, 10)}
            </span>
        );
    };

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
                    body={nameBodyTemplate}
                />
                {/* Date */}
                <Column
                    field="date"
                    header={lng === "mn" ? "Шинэчлэгдсэн огноо" : "Updated date"}
                    sortable
                    className="nso_table_col"
                    body={dateBodyTemplate}
                />
            </DataTable>
        </div>
    );
}
