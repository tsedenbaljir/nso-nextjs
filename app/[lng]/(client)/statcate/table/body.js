import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import Link from "next/link";

// Name column body
export default function nameBodyTemplate(rowData, lng, sector, subsector, expandedRow, setExpandedRow) {
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
                    if (isExpanded) {
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