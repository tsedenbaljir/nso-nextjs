"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { TabView, TabPanel } from "primereact/tabview";
import LoadingDiv from '@/components/Loading/Text/Index';

export default function Tabs({ sector, subsector }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [data, setData] = useState([]); // Store API data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [name, setName] = useState(null);

    useEffect(() => {
        // Fetch subcategories for each category
        const fetchSubcategories = async (categoryId) => {
            try {
                const response = await fetch(`/api/subsectorname?subsectorname=${categoryId}`);
                const result = await response.json();    
                setName(result.data.filter(e => e.id === decodeURIComponent(subsector)))
                
                if (!Array.isArray(result.data)) {
                    return [];
                }
            } catch (error) {
                console.error(`Error fetching subcategories for ${categoryId}:`, error);
                return [];
            }
        };
        fetchSubcategories(sector)
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/sectortablename?sector=${decodeURIComponent(sector)}&subsector=${decodeURIComponent(subsector)}`);
                const response = await res.json();

                // Format API data for DataTable
                const formattedData = response.data.map((item, index) => ({
                    id: index + 1,
                    link: item.id,
                    name: item.text,
                    date: item.updated,
                    category: item.type === "t" ? "Текст" : "Бусад"
                }));

                setData(formattedData);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sector, subsector]); // Refetch when `sectors` changes

    return (
        <div id="stat_cate" className="nso_cate_body">
            {/* Title */}
            <span className="__cate_title">{name && name[0].text}</span>
            {/* PrimeReact Tabs */}
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                {/* Хүснэгт Tab */}
                <TabPanel header="Хүснэгт">
                    <div className="bg-white">
                        {loading ? (
                            <div className="text-center py-4">
                                <LoadingDiv />
                                <br />
                                <LoadingDiv />
                                <br />
                                <LoadingDiv />
                            </div>
                        ) : error ? (
                            <p className="p-4 text-red-500">{error}</p>
                        ) : (
                            <DataTable value={data} paginator rows={10} className="nso_table">
                                <Column
                                    field="id"
                                    header="No."
                                    className="nso_table_col"
                                    body={(rowData) => (
                                        <span className="hover:text-blue-700 hover:underline text-blue-400 font-bold">
                                            {rowData.id}
                                        </span>
                                    )}
                                />
                                <Column
                                    field="name"
                                    header="Нэр"
                                    sortable
                                    className="nso_table_col"
                                    body={(rowData) => (
                                        <Link href={`${process.env.BASE_API_URL}/pxweb/mn/NSO/NSO__${sector}__${subsector}/` + rowData.link}
                                            className="hover:text-blue-700 hover:underline text-gray-900 font-medium">
                                            {rowData.name}
                                        </Link>
                                    )} />
                                <Column
                                    field="date"
                                    header="Шинэчлэгдсэн огноо"
                                    sortable
                                    className="nso_table_col"
                                    body={(rowData) => (
                                        <span className="hover:text-blue-700 hover:underline text-blue-400 font-medium">
                                            {rowData.date.substr(0, 10)}
                                        </span>
                                    )} />
                                {/* <Column
                                    field="category"
                                    header="Бүлэг сонгох"
                                    className="nso_table_col"
                                    body={(rowData) => (
                                        <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                                            {rowData.category}
                                        </span>
                                    )}
                                /> */}
                            </DataTable>
                        )}
                    </div>
                </TabPanel>

                {/* Other Tabs */}
                <TabPanel header="Танилцуулга">
                    <p className="p-4">Энэ бол Танилцуулгын хэсэг.</p>
                </TabPanel>

                <TabPanel header="Тайлан">
                    <p className="p-4">Энэ бол Тайлангийн хэсэг.</p>
                </TabPanel>

                <TabPanel header="Аргачлал">
                    <p className="p-4">Энэ бол Аргачлалын хэсэг.</p>
                </TabPanel>

                <TabPanel header="Чанарын тайлан">
                    <p className="p-4">Энэ бол Чанарын тайлангийн хэсэг.</p>
                </TabPanel>
            </TabView>
        </div>
    );
}
