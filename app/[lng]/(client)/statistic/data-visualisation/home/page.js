"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingDiv from '@/components/Loading/Text/Index';
// import DynamicSidebar from "@/components/statcate/DynamicSidebar";
import '@/components/styles/statistic.scss';

export default function Statcate({ params: { lng } }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/data-visualisation?lng=${lng}`);
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
    }, [lng]);

    return (
        <div className='nso_container'>
            {loading ? (
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
                <div className="data_viz_item">
                    {data.map((dt, index) => (
                        <div className="_card" key={index} onClick={() => {
                            router.push("about-survey/" + dt.id)
                        }}>
                            <img
                                className="cover"
                                src={`${dt.file_info && "/uploads/" + JSON.parse(dt.file_info).pathName || "/images/news1.png"}`}
                                alt={dt.name}
                            />
                            <span className="title">{dt.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
