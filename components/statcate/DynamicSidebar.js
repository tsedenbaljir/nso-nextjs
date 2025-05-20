"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingDiv from '@/components/Loading/Text/Index';

export default function DynamicSidebar({ sectorData, subsector, lng }) {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchSubcategories = async (categoryId) => {
            try {
                const response = await fetch(`/api/subsectorname?subsectorname=${decodeURIComponent(categoryId)}&lng=${lng}`);
                if (!response.ok) throw new Error(`Failed to fetch subcategories for ${categoryId}`);

                const result = await response.json();
                if (!Array.isArray(result.data)) return [];

                return result.data.map((item) => ({
                    id: item.id,
                    label: item.text,
                    isActive: item.id === decodeURIComponent(subsector),
                    onClick: () => router.push(`/${lng}/statcate/table/${categoryId}/${decodeURIComponent(item.id)}`),
                }));
            } catch (error) {
                console.error(`Error fetching subcategories for ${categoryId}:`, error);
                return [];
            }
        };

        const fetchMenuData = async () => {
            try {
                if (!sectorData.length) return;

                // ✅ Ensure the sectors appear in the correct order
                let orderedSectors = [];
                try {
                    orderedSectors.push(sectorData[5]);
                    orderedSectors.push(sectorData[4]);
                    orderedSectors.push(sectorData[1]);
                    orderedSectors.push(sectorData[3]);
                    orderedSectors.push(sectorData[6]);
                    orderedSectors.push(sectorData[0]);
                    // Skipping `sectorData[2]` as per your comment: // түүхэн статистик
                } catch (err) {
                    console.error("Error ordering sectors:", err);
                }

                const menuWithSubcategories = await Promise.all(
                    orderedSectors.map(async (category) => {
                        if (!category) return null; // Ensure no errors if index is undefined
                        const subItems = await fetchSubcategories(category.id);
                        return {
                            label: category.text,
                            id: category.id,
                            subcategories: subItems,
                            isActive: category.id === decodeURIComponent(subsector),
                        };
                    })
                );

                setMenuItems(menuWithSubcategories.filter(Boolean)); // Remove null values
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch menu data.");
            } finally {
                setLoading(false);
            }
        };

        fetchMenuData();
    }, [subsector, sectorData]); // Runs when `subsector` or `sectorData` changes

    return (
        <>
            <div className="statcatebody">
                <div className="nso_container">
                    <div className="__card_groups">
                        {menuItems.map((category) => (
                            <div key={category.id} className="__card">
                                <span className="__title">{category.label}</span>
                                {loading ? (
                                    <div className="text-center py-4">
                                        <LoadingDiv />
                                        <br />
                                        <LoadingDiv />
                                        <br />
                                        <LoadingDiv />
                                    </div>
                                ) : error ? (
                                    <p className="text-red-500">Алдаа гарсан байна. Та түр хүлээнэ үү.</p>
                                ) : (
                                    <div className="__category_group">
                                        {category.subcategories.map((sub) => (
                                            <span
                                                key={sub.id}
                                                className={`cursor-pointer ${sub.isActive ? "active-link" : ""}`}
                                                onClick={sub.onClick}
                                            >
                                                {sub.label}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
