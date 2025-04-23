"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import LoadingDiv from "@/components/Loading/Text/Index";

export const dynamic = "force-dynamic";

export default function Main({ lng, sector, subsector }) {
    const [data, setData] = useState(null); // Store API data
    const [iframeSrc, setIframeSrc] = useState(""); // Store iframe URL
    const [error, setError] = useState(null); // Store error messages
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch subcategories
                const response = await fetch(`/api/catalogue?list_id=${subsector}`, { cache: "no-store" });
                if (!response.ok) throw new Error("Failed to fetch catalogue data");

                const result = await response.json();

                if (result.data) {
                    setData(result.data);

                    const params = new URLSearchParams();
                    params.append('key', 'value');
                    // Fetch Tableau Key
                    const tableauResponse = await fetch(`https://gateway.1212.mn/services/dynamic/api/public/tableau-report?${params.toString()}`, { cache: "no-store" });
                    if (!tableauResponse.ok) throw new Error("Failed to fetch Tableau key");

                    const tableauResult = await tableauResponse.json();
                    
                    const tkt = tableauResult?.value;

                    // Ensure `data.tableau` exists before setting `iframeSrc`
                    if (tkt && result.data.tableau) {
                        setIframeSrc(`https://tableau.1212.mn/trusted/${tkt}${result.data.tableau}`);
                    }
                } else {
                    console.error("No data found in catalogue response");
                }
            } catch (err) {
                setError("Failed to fetch data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subsector]); // Fetch data when subsector changes

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
                <>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}  className="text-black" >
                        {lng === "mn" ? data.info : data.info_eng || "No content available"}
                    </ReactMarkdown>

                    <br />

                    {/* Render iframe directly instead of using raw HTML */}
                    {iframeSrc && (
                        <div className="w-full h-[850px]">
                            <iframe
                                src={iframeSrc}
                                width="100%"
                                height="850"
                                style={{ border: "none" }}
                                loading="lazy"
                            ></iframe>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
