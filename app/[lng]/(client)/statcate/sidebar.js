"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelMenu } from "primereact/panelmenu";
import { useTranslation } from '@/app/i18n/client';
import Result from '@/components/Search/subMain/Result';
import MainSearch from '@/components/Search/subMain/MainSearch';
import LoadingDiv from '@/components/Loading/Text/Index';

export default function DynamicSidebar({ sector, subsector, lng }) {
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
                // const data = result.data;

                var convert = [];

                convert.push(result.data.filter(e=>e.id === "Population, household")[0]);
                convert.push(result.data.filter(e=>e.id === "Society, development")[0]);
                convert.push(result.data.filter(e=>e.id === "Labour, business")[0]);
                convert.push(result.data.filter(e=>e.id === "Industry, service")[0]);
                convert.push(result.data.filter(e=>e.id === "Economy, environment")[0]);
                convert.push(result.data.filter(e=>e.id === "Education, health")[0]);
                convert.push(result.data.filter(e=>e.id === "Regional development")[0]);
                convert.push(result.data.filter(e=>e.id === "Historical data")[0]); //түүхэн статистик

                if (!Array.isArray(convert)) {
                    setError("Unexpected API response format. Check console.");
                    return;
                }

                // Fetch subSectors
                const fetchSubcategories = async (categoryId) => {
                    try {
                        const response = await fetch(`${process.env.BACKEND_URL}/api/subsectorname?subsectorname=${decodeURIComponent(categoryId)}&lng=${lng}`);
                        const result = await response.json();

                        if (!Array.isArray(result.data)) {
                            return [];
                        }

                        // ✅ Add `command` to update URL when clicked
                        return result.data.map((item) => ({
                            id: item.id,
                            label: item.text.split('_')[1] ? item.text.split('_')[1] : item.text,
                            className: item.id === decodeURIComponent(subsector) ? "active-link" : "",
                            command: () => {
                                router.push(`/${lng}/statcate/table/${categoryId}/${decodeURIComponent(item.id)}`);
                            }
                        })).sort((a, b) => a.id.localeCompare(b.id));

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
                            className: category.id === decodeURIComponent(sector) ? "active-header-link" : "",
                            expanded: category.id === decodeURIComponent(sector) // Auto-expand active submenu
                        };
                    })
                );

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
            <div className="__cate_search">
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
