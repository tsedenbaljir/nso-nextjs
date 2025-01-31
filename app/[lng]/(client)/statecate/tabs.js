"use client";
import { useEffect, useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Link from 'next/link';

export default function Tabs({ sector, subsector }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [data, setData] = useState([]); // Store API data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = `${process.env.BASE_API_URL}/mn/NSO/${sector}/${subsector}`;

    useEffect(() => {   
        const fetchData = async () => {
            try {
                const response = await fetch(API_URL);
                const textData = await response.text();
                const validJson = textData.replace(/^{.*?}\[/, "[");
                const parsedData = JSON.parse(validJson);

                if (!Array.isArray(parsedData)) {
                    console.error("Unexpected API response format:", parsedData);
                    setError("Unexpected API response format.");
                    return;
                }

                // Format API data for DataTable
                const formattedData = parsedData.map((item, index) => ({
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
            <span className="__cate_title">Хүн ам, өрх</span>
            {/* PrimeReact Tabs */}
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                {/* Хүснэгт Tab */}
                <TabPanel header="Хүснэгт">
                    <div className="bg-white">
                        {loading ? (
                            <p className="p-4 text-gray-500">Loading data...</p>
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
                                        <Link href={`http://10.0.1.39/pxweb/mn/NSO/NSO__${sector}__${subsector}/` + rowData.link}
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
