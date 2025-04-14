"use client";
import { useEffect, useState } from "react";
import List from "../../list";
import Sidebar from "../../sidebar";
import { useTranslation } from '@/app/i18n/client';

export default function StateCate({ params: { lng }, params }) {
    const { type } = params;
    const { t } = useTranslation(lng, "lng", "");
    const [searchTerm, setSearchTerm] = useState("");

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, first: 0, rows: 10 });

    const fetchSubcategories = async (value) => {
        try {
            const response = await fetch(`/api/file-library?lng=${lng}&type=${type}&searchTerm=${value || ""}`);
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const result = await response.json();

            if (Array.isArray(result.data)) {
                setMenuItems(result.data);
                setPagination((prev) => ({ ...prev, total: result.data.length }));
            } else {
                setMenuItems([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubcategories();
    }, [lng, type]);

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        if (value.length > 3 || value.length === 0) {
            fetchSubcategories(value);
        }
    };

    return (
        <div>
            <div className="nso_container">
                <div className="__main_search" >
                    <span className="__search" style={{ border: "1px solid #005baa" }}>
                        <input
                            className="p-autocomplete-input p-inputtext p-component"
                            placeholder={t("download.search")}
                            value={searchTerm}
                            style={{ border: "0" }}
                            onChange={handleSearchChange}
                        />
                        <button
                            className="p-autocomplete-dropdown p-ripple p-button p-component p-button-icon-only"
                            // onClick={handleSearchClick}
                            style={{
                                width: 80,
                                borderRadius: 0,
                                border: 0,
                                background: "var(--surface-c)"
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                        </button>
                    </span>
                </div>
            </div>
            <div className="nso_container">
                {/* Sidebar */}
                <div className="nso_cate_section left-bar">
                    <div className='__cate_groups_lib'>
                        <Sidebar lng={lng} type={type} />
                    </div>
                </div>
                {/* Main Content */}
                <List lng={lng} type={type} menuItems={menuItems} loading={loading} pagination={pagination} setPagination={setPagination} />
            </div>
        </div>
    );
}
