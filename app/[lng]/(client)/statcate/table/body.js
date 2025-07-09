"use client";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useEffect, useState } from "react";

var expandedRowsDate = null;
// Name column body
export function NameBodyTemplate(rowData, lng, sector, subsector, setExpandedRow) {
    const [expandedRows, setExpandedRows] = useState(null);

    if (!rowData || !rowData.link) return null;
    const isExpanded = expandedRows === rowData.link;
    const hasSub = Array.isArray(rowData.sub) && rowData.sub.length > 0;

    useEffect(() => {
        setExpandedRow(expandedRows);
    }, [expandedRows]);

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
                    if (isExpanded) {
                        expandedRowsDate = null;
                        setExpandedRows(null);
                    } else {
                        expandedRowsDate = rowData.link;
                        setExpandedRows(rowData.link);
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
                <div className="ml-4 my-2">
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

export function DateBodyTemplate(rowData) {
    const isExpanded = expandedRowsDate === rowData.link;
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