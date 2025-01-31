"use client";
import { useEffect, useState } from "react";
import { PanelMenu } from "primereact/panelmenu";
import { useRouter } from "next/navigation";

export default function DynamicSidebar({ subsector }) {
    const [menuItems, setMenuItems] = useState([]); // Stores categories & subcategories
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const router = useRouter();// Get active sector from URL

    const BASE_API_URL = process.env.BASE_API_URL;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch main categories
                const response = await fetch(`${BASE_API_URL}/mn/NSO`);
                const textData = await response.text();
                const validJson = textData.replace(/^{.*?}\[/, "[");
                const categories = JSON.parse(validJson);
                var convert = [];

                convert.push(categories[5]);
                convert.push(categories[4]);
                convert.push(categories[1]);
                convert.push(categories[3]);
                convert.push(categories[6]);
                convert.push(categories[0]);
                convert.push(categories[2]);

                if (!Array.isArray(convert)) {
                    setError("Unexpected API response format. Check console.");
                    return;
                }

                // Fetch subcategories for each category
                const fetchSubcategories = async (categoryId) => {
                    console.log("categoryId===>", categoryId);

                    try {
                        const res = await fetch(`${BASE_API_URL}/mn/NSO/${encodeURIComponent(categoryId)}`);
                        const subText = await res.text();
                        const subValidJson = subText.replace(/^{.*?}\[/, "[");
                        const dt = JSON.parse(subValidJson);

                        if (!Array.isArray(dt)) {
                            console.error("Subcategory response is not an array:", dt);
                            return [];
                        }

                        // ✅ Add `command` to update URL when clicked
                        return dt.map((item) => ({
                            id: item.id,
                            label: item.text,
                            className: item.id === subsector ? "active-link" : "",
                            command: () => {
                                router.push(`/mn/statecate/${categoryId}/${encodeURIComponent(item.id)}`);
                            }
                        }));

                    } catch (error) {
                        console.error(`Error fetching subcategories for ${categoryId}:`, error);
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
                            className: category.id === subsector ? "active-header-link" : "",
                            expanded: subItems.some((sub) => sub.id === subsector) // Auto-expand active submenu
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
        <div className="nso_cate_section left-bar">
            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <PanelMenu model={menuItems} className="w-full nso_cate_selection" />
            )}
        </div>
    );
}
