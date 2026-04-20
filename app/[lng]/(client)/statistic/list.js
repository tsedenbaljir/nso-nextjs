"use client";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Paginator } from "primereact/paginator";
import { getSectorNameById } from "./sectors";
import { CENSUS_SUB_FILTER_YEARS_BY_ID } from "@/lib/census-file-library-years";

export default function Tabs({
    lng,
    type,
    menuItems,
    loading,
    pagination,
    setPagination,
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeSub = searchParams.get("sub") ?? undefined;

    const typeNum =
        type === undefined || type === null || type === ""
            ? NaN
            : parseInt(String(type), 10);
    const censusYearOptions =
        !Number.isNaN(typeNum) &&
        (CENSUS_SUB_FILTER_YEARS_BY_ID[typeNum]?.length ?? 0) > 0
            ? CENSUS_SUB_FILTER_YEARS_BY_ID[typeNum]
            : null;

    const setSubYearFilter = (year) => {
        const params = new URLSearchParams(searchParams.toString());
        if (year == null || year === "") {
            params.delete("sub");
        } else {
            params.set("sub", String(year));
        }
        const q = params.toString();
        router.push(q ? `${pathname}?${q}` : pathname);
    };

    const [isOpen, setIsOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState(lng === "mn" ? "Эхэнд шинэчлэгдсэн" : "Updated first");

    const filters = [
        lng === "mn" ? "Эхэнд шинэчлэгдсэн" : "Updated first",
        lng === "mn" ? "Үсгийн дарааллаар" : "Alphabetical order",
        lng === "mn" ? "Хандалтын тоогоор" : "Views order",
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
        if (activeFilter === (lng === "mn" ? "Эхэнд шинэчлэгдсэн" : "Updated first")) {
            sorted.sort(
                (a, b) =>
                    new Date(b.published_date || 0) - new Date(a.published_date || 0)
            );
        } else if (activeFilter === (lng === "mn" ? "Үсгийн дарааллаар" : "Alphabetical order")) {
            sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        } else if (activeFilter === (lng === "mn" ? "Хандалтын тоогоор" : "Views order")) {
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
                                {getSectorNameById(type, lng)}
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
                                    {lng === "mn" ? "Эрэмбэлэх" : "Sort"}
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
                        {censusYearOptions && (
                            <div className="flex gap-2 mb-3 mt-2 items-start">
                                <span className="text-sm text-gray-600 mr-1 shrink-0 pt-1.5">
                                    {lng === "mn" ? "Он:" : "Year:"}
                                </span>
                                <div className="min-w-0 flex-1 max-h-32 sm:max-h-36 overflow-y-auto overscroll-y-contain pr-1 [scrollbar-gutter:stable]">
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <button
                                            type="button"
                                            onClick={() => setSubYearFilter(null)}
                                            className={`px-3 py-1 rounded-full border text-sm transition-colors shrink-0 ${
                                                activeSub == null || activeSub === ""
                                                    ? "border-[#005baa] bg-blue-50 text-[#005baa]"
                                                    : "border-gray-300 bg-white hover:bg-gray-50"
                                            }`}
                                        >
                                            {lng === "mn" ? "Бүгд" : "All"}
                                        </button>
                                        {censusYearOptions.map((year) => (
                                            <button
                                                key={year}
                                                type="button"
                                                onClick={() => setSubYearFilter(year)}
                                                className={`px-3 py-1 rounded-full border text-sm transition-colors shrink-0 ${
                                                    activeSub === String(year)
                                                        ? "border-[#005baa] bg-blue-50 text-[#005baa]"
                                                        : "border-gray-300 bg-white hover:bg-gray-50"
                                                }`}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
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
                                            {item.name || (lng === "mn" ? "Нэр байхгүй" : "Name is missing")}
                                        </div>

                                        {/* Тайлбар */}
                                        <div className="clamp-description mt-1 mb-2">
                                            {item.info || (lng === "mn" ? "Тайлбар алга" : "Info is missing")}
                                        </div>

                                        {/* Metadata */}
                                        <div className="__file_table_foot">
                                            <div className="_file_publishedDate">
                                                {item.published_date
                                                    ? new Date(item.published_date)
                                                        .toISOString()
                                                        .split("T")[0]
                                                    : lng === "mn" ? "Огноо байхгүй" : "Date is missing"}
                                            </div>
                                            <div className="_file_view">👁 {(item.views ?? 0).toLocaleString()}</div>
                                            <div className="_file_type">
                                                <span className="text-blue-600 font-medium uppercase">
                                                    {ext}
                                                </span>
                                            </div>
                                            <div className="_file_size">
                                                {lng === "mn" ? "Файлын хэмжээ:" : "File size:"}{" "}
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
