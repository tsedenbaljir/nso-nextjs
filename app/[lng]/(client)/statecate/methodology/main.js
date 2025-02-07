"use client";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import LoadingDiv from '@/components/Loading/Text/Index';

export default function Main({ sector, subsector }) {

    // Set initial active tab
    const [data, setData] = useState([]); // Store API data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch subcategories
        const fetchSubcategories = async (categoryId) => {
            try {
                const response = await fetch(`/api/catalogue?list_id=${subsector}`);
                const result = await response.json();
                setData(result)
                if (!Array.isArray(result.data)) {
                    return [];
                }
            } catch (error) {
                setError("Failed to fetch data.");
                return [];
            } finally {
                setLoading(false);
            }
        };
        fetchSubcategories(sector);
    }, [sector, subsector]);
    return (
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
                            <Link href={`${process.env.BASE_FRONT_URL}/pxweb/mn/NSO/NSO__${sector}__${subsector}/` + rowData.link}
                                className="hover:text-blue-700 hover:underline text-gray-900 font-medium">
                                {rowData.name}
                            </Link>
                        )}
                    />
                    <Column
                        field="date"
                        header="Шинэчлэгдсэн огноо"
                        sortable
                        className="nso_table_col"
                        body={(rowData) => (
                            <span className="hover:text-blue-700 hover:underline text-blue-400 font-medium">
                                {rowData.date.substr(0, 10)}
                            </span>
                        )}
                    />
                </DataTable>
            )}
        </div>
    );
}
