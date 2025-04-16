"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingDiv from '@/components/Loading/Text/Index';
import DynamicSidebar from "@/components/statcate/DynamicSidebar";
import '@/components/styles/statistic.scss';

export default function Statcate({ params }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/data-visualisation?id=${params.id}`);
                if (!response.ok) throw new Error("Failed to fetch data");

                const result = await response.json();
                setData(result);
            } catch (err) {
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        loading ? (
            <div className="">
                <LoadingDiv />
                <br />
                <LoadingDiv />
                <br />
                <LoadingDiv />
                <br />
            </div>
        ) : error ? (
            <p className="text-red-500">Алдаа гарсан байна. Та түр хүлээнэ үү.</p>
        ) : (
            <div>
                <div className='__cate_title text-2xl font-medium'>
                    {data.name}
                </div>
                <div class="nso_tab">
                    <div class="nso_tab_content">
                        <div class="__stat_detail_tableau">
                            <div className='__dtab_main_text'
                                dangerouslySetInnerHTML={{ __html: data.info }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    );
}
