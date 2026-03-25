"use client";
import React, { useEffect, useState } from "react";
import LoadingDiv from '@/components/Loading/Text/Index';
import DynamicSidebar from "@/components/statcate/DynamicSidebar";

export default function Statcate({ params: { lng, subsector } }) {
    const [sectorData, setSectorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSectorData = async () => {
            try {
                const response = await fetch(`/api/sectorname?lng=${lng}`);
                if (!response.ok) throw new Error("Failed to fetch sector data");

                const result = await response.json();
                setSectorData(result.data);
            } catch (err) {
                console.error("Error fetching sector data:", err);
                setError("Failed to load sector data.");
            } finally {
                setLoading(false);
            }
        };

        fetchSectorData();
    }, [lng]); // Fetch when language changes

    return (
        <div>
            {loading ? (
                <div className="nso_statistic_category">
                    <div className="nso_container">
                        <LoadingDiv />
                        <br />
                        <LoadingDiv />
                        <br />
                        <LoadingDiv />
                        <br />
                    </div>
                </div>
            ) : error ? (
                <p className="text-red-500">Алдаа гарсан байна. Та түр хүлээнэ үү.</p>
            ) : (
                <DynamicSidebar sectorData={sectorData} subsector={subsector} lng={lng} />
            )}
        </div>
    );
}
