import { useState } from "react";
import { Paginator } from "primereact/paginator";
import { sectors_list } from "./sectors";

export default function Tabs({
    lng,
    type,
    menuItems,
    loading,
    pagination,
    setPagination,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState("Эхэнд шинэчлэгдсэн");

    const filters = [
        "Эхэнд шинэчлэгдсэн",
        "Үсгийн дарааллаар",
        "Хандалтын тоогоор",
    ];

    const toggleDropdown = () => setIsOpen(!isOpen);
    const handleFilterSelect = (filter) => {
        setActiveFilter(filter);
        setIsOpen(false);
    };

    const onPageChange = (event) => {
        setPagination({
            ...pagination,
            first: event.first,
            rows: event.rows,
        });
    };

    const getSortedItems = () => {
        const sorted = [...menuItems];
        if (activeFilter === "Эхэнд шинэчлэгдсэн") {
            sorted.sort(
                (a, b) =>
                    new Date(b.published_date || 0) - new Date(a.published_date || 0)
            );
        } else if (activeFilter === "Үсгийн дарааллаар") {
            sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        } else if (activeFilter === "Хандалтын тоогоор") {
            sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
        }
        return sorted;
    };

    // const getExtension = (file_info) => {
    //     try {
    //         const file =
    //             typeof file_info === "string" ? JSON.parse(file_info) : file_info;
    //         return file?.extension?.toUpperCase() || "N/A";
    //     } catch {
    //         return "N/A";
    //     }
    // };

    const onDownloadDirect = async (fileInfo, id) => {
        try {
            const parsed =
                typeof fileInfo === "string" ? JSON.parse(fileInfo) : fileInfo;
            if (!parsed?.pathName) return;
            const url = `${process.env.FRONTEND}/uploads/${parsed.pathName}`;
            window.open(url, "_blank");
            await fetch(`/api/file-library`, {
                method: "POST",
                body: JSON.stringify({ id }),
            });
        } catch (err) {
            console.error("Download error:", err);
        }
    };
    const safeParse = (json) => {
        if (typeof json !== "string") return json;
        try {
            return JSON.parse(json);
        } catch (e) {
            console.warn("⚠ JSON.parse алдаа:", e.message, json);
            return null; // алдаатай бол null буцаана
        }
    };
    const pagedItems = getSortedItems().slice(
        pagination.first,
        pagination.first + pagination.rows
    );

    return (
        <div id="stat_cate" className="w-full">
            <div className="nso_tab_content">
                <div className="__table_desktop">
                    <div className="__sector_list">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <span className="__sector_header">
                                {lng === "mn" ? sectors_list.find((e) => e.type === type)?.mnName : sectors_list.find((e) => e.type === type)?.enName || "All files"}
                            </span>

                            {/* Dropdown */}
                            <div className="relative inline-block text-left">
                                {/* Toggle button */}
                                <button
                                    onClick={toggleDropdown}
                                    className="inline-flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-100 text-sm"
                                >
                                    <svg
                                        className="w-4 h-4 text-gray-700"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1M4 8h16M4 12h16M4 16h16M4 20h16"
                                        />
                                    </svg>
                                    Эрэмбэлэх
                                </button>

                                {/* Dropdown */}
                                {isOpen && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200  rounded-md shadow-md z-20">
                                        {filters.map((filter) => (
                                            <div
                                                key={filter}
                                                onClick={() => handleFilterSelect(filter)}
                                                className={`px-4 py-2 text-sm cursor-pointer ${activeFilter === filter
                                                    ? "bg-gray-100 flex justify-between items-center"
                                                    : "hover:bg-gray-100"
                                                    }`}
                                            >
                                                <span>{filter}</span>
                                                {activeFilter === filter && (
                                                    <span className="text-xs">↓</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='mb-4' style={{
                            height: 30,
                            fontWeight: 500,
                            fontSize: "var(--font-size14)",
                            color: "var(--text-main)",
                            background: "var(--table-header)",
                            transition: "box-shadow .2s",
                            whiteSpace: "nowrap",
                            borderBottom: "1px solid rgba(90,90,90,.1)",
                        }} />
                        {/* File List */}
                        <div className="__file_table">
                            {pagedItems.map((item, index) => {
                                const fileInfo = safeParse(item.file_info);
                                const ext = fileInfo?.extension?.toLowerCase() || "file";
                                const size =
                                    item?.file_size >= 1024 * 1024
                                        ? `${(item.file_size / 1024 / 1024).toFixed(2)} MB`
                                        : `${(item.file_size / 1024).toFixed(1)} kB`;

                                return (
                                    <div key={index} className="border-dashed border-b pb-4 px-3 mb-4">
                                        {/* Гарчиг */}
                                        <div
                                            className="clamp-title text-gray-800 hover:text-gray-800"
                                            onClick={() => onDownloadDirect(item.file_info, item.id)}
                                        >
                                            {item.name || "Нэр байхгүй"}
                                        </div>

                                        {/* Тайлбар */}
                                        <div className="clamp-description mt-1 mb-2">
                                            {item.info || "Тайлбар алга"}
                                        </div>

                                        {/* Metadata */}
                                        <div className="__file_table_foot">
                                            <div className="_file_publishedDate">
                                                {item.published_date
                                                    ? new Date(item.published_date)
                                                        .toISOString()
                                                        .split("T")[0]
                                                    : "Огноо байхгүй"}
                                            </div>
                                            <div className="_file_view">👁 {(item.views ?? 0).toLocaleString()}</div>
                                            <div className="_file_type">
                                                <span className="text-blue-600 font-medium uppercase">
                                                    {ext}
                                                </span>
                                            </div>
                                            <div className="_file_size">
                                                {lng === "mn" ? "Файлын хэмжээ:" : "File Size:"}{" "}
                                                {size}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        <div className="__pagination mt-6 flex items-center justify-between">
                            <span>
                                {lng === "mn" ? "Нийт:" : "Total:"}{" "}
                                <strong>{pagination.total}</strong>
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
    );
}
