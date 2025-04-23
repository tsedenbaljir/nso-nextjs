"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PanelMenu } from "primereact/panelmenu";
import { usePathname } from "next/navigation";
import LoadingDiv from '@/components/Loading/Text/Index';

export default function DynamicSidebar({ params, lng }) {
    const pathname = usePathname();

    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    // 
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Extract ID from pathname if it exists
                const pathParts = pathname.split('/');
                const idFromPath = pathParts[pathParts.length - 1];

                // First fetch all items for the menu
                const response = await fetch(`/api/data-visualisation?lng=${lng}`);
                if (!response.ok) throw new Error("Failed to fetch data");

                const result = await response.json();
                const menuWithSubcategories = await Promise.all(
                    result.map(async (dt) => {
                        // If this item matches the current path ID, fetch its specific data
                        if (dt.id === idFromPath) {
                            const detailResponse = await fetch(`/api/data-visualisation?id=${dt.id}`);
                            if (detailResponse.ok) {
                                const detailData = await detailResponse.json();
                                dt = { ...dt, ...detailData };
                            }
                        }

                        return {
                            label: dt.name,
                            id: dt.id,
                            items: [{
                                id: 1,
                                label: "Судалгааны тухай",
                                className: pathname.includes(`about-survey/${dt.id}`) ? "active-link" : "",
                                command: () => {
                                    router.push(`/${lng}/statistic/data-visualisation/about-survey/${dt.id}`);
                                }
                            }, {
                                id: 2,
                                label: "Судалгааны материалууд",
                                className: pathname.includes(`survey-materials/${dt.id}`) ? "active-link" : "",
                                command: () => {
                                    router.push(`/${lng}/statistic/data-visualisation/survey-materials/${dt.id}`);
                                }
                            }, {
                                id: 3,
                                label: "Дашбоард",
                                className: pathname.includes(`dashboard/${dt.id}`) ? "active-link" : "",
                                command: () => {
                                    router.push(`/${lng}/statistic/data-visualisation/dashboard/${dt.id}`);
                                }
                            }],
                            className: pathname.includes(dt.id) ? "active-header-link" : "",
                            expanded: pathname.includes(dt.id)
                        };
                    })
                );
                setMenuItems(menuWithSubcategories);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [lng, pathname]);
    return (
        <>
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
                    <div className='__cate_groups'>
                        <PanelMenu
                            model={menuItems}
                            className="w-full nso_cate_selection min_cate"
                            multiple={false}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
