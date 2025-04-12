"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelMenu } from "primereact/panelmenu";
import { useTranslation } from '@/app/i18n/client';
import Result from '@/components/Search/subMain/Result';
import MainSearch from '@/components/Search/subMain/MainSearch';
import LoadingDiv from '@/components/Loading/Text/Index';

export default function DynamicSidebar({ subsector, lng }) {
    const { t } = useTranslation(lng, "lng", "");
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showResult, setShowResult] = useState(false);
    const [search, setSearching] = useState({});
    const [data, setData] = useState({});
    const [loadingSearch, setLoadingSearch] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch main Sectors
                const response = await fetch(`/api/sectorname?lng=${lng}`);
                const result = await response.json();

                var convert = [];

                convert.push(result.data[6]);
                convert.push(result.data[5]);
                convert.push(result.data[2]);
                convert.push(result.data[4]);
                convert.push(result.data[7]);
                convert.push(result.data[0]);
                convert.push(result.data[1]);
                convert.push(result.data[3]); //түүхэн статистик

                if (!Array.isArray(convert)) {
                    setError("Unexpected API response format. Check console.");
                    return;
                }

                // Fetch subSectors
                const fetchSubcategories = async (categoryId) => {
                    try {
                        const response = await fetch(`/api/subsectorname?subsectorname=${decodeURIComponent(categoryId)}&lng=${lng}`);
                        const result = await response.json();

                        if (!Array.isArray(result.data)) {
                            return [];
                        }

                        // ✅ Add `command` to update URL when clicked
                        return result.data.map((item) => ({
                            id: item.id,
                            label: item.text,
                            className: item.id === decodeURIComponent(subsector) ? "active-link" : "",
                            command: () => {
                                router.push(`/mn/statcate/table/${categoryId}/${decodeURIComponent(item.id)}`);
                            }
                        }));

                    } catch (error) {
                        // console.error(`Error fetching subcategories for ${categoryId}:`, error);
                        return [];
                    }
                };

                // Fetch subcategories for all categories
                const menuWithSubcategories = await Promise.all(
                    convert.map(async (category) => {
                        const subItems = await fetchSubcategories(category.id);
                        return {
                            label: category.text,
                            id: category.id,
                            items: subItems,
                            className: category.id === decodeURIComponent(subsector) ? "active-header-link" : "",
                            expanded: subItems.some((sub) => sub.id === decodeURIComponent(subsector)) // Auto-expand active submenu
                        };
                    })
                );
                // console.log(menuWithSubcategories);

                setMenuItems(menuWithSubcategories);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch data.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [subsector]); // Refetch when `sectors` changes

    return (
        <>
            <div class="__cate_search">
                <div className="__main_search">
                    <MainSearch setShowResult={setShowResult} t={t} setSearching={setSearching} setData={setData} setLoading={setLoadingSearch} />
                    {search.length > 2 && <Result type={1} showResult={showResult} t={t} loading={loadingSearch} data={data} lng={lng} />}
                </div>
            </div>
            <div className="nso_cate_section left-bar">
                {loading ? (
                    <div className="text-center py-4">
                        <LoadingDiv />
                        <br />
                        <LoadingDiv />
                        <br />
                        <LoadingDiv />
                        <br />
                        <LoadingDiv />
                    </div>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <PanelMenu model={menuItems} className="w-full nso_cate_selection" />
                )}
            </div>
        </>
    );
}
