"use client";
import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import LoadingDiv from '@/components/Loading/Text/Index';

export default function Main({ lng, sector, subsector }) {
    // Set initial active tab
    const [data, setData] = useState([]); // Store API data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [iframeContent, setIframeContent] = useState("");

    useEffect(() => {
        const tableau = async (tableauName) => {
            const requestBody = new URLSearchParams();
            requestBody.append("username", "ViewerUser");
            const response = await fetch(`/api/tableau-key`);
            const result = await response.json();
            const tkt = result.value;
            const iframeSrc = `https://tableau.1212.mn/trusted/${tkt}/${tableauName}`;
            const iframeContent = `<embed src='${iframeSrc}' width='100%' height='850' style='border: none'></embed>`;
            setIframeContent(iframeContent);
        }

        // Fetch subcategories
        const fetchSubcategories = async () => {
            try {
                const response = await fetch(`/api/catalogue?list_id=${subsector}`);
                const result = await response.json();
                setData(result.data)
                tableau(result.data.tableau)
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
        fetchSubcategories();
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
                <>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                    >
                        {lng === 'mn' ? data.info : data.info_eng || 'No content available'}
                    </ReactMarkdown>
                    <br />
                    {data.tableau && <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                    >
                        {iframeContent}
                    </ReactMarkdown>}
                </>
            )}
        </div>
    );
}
