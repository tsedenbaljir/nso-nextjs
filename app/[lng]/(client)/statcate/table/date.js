"use client";

// Date column body
export default function dateBodyTemplate(rowData, expandedRow) {
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
