"use client";

import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import PdfViewer from '@/components/PdfViewer/index';
import { useParams } from "next/navigation";

export default function Methodology({ params: lng }) {
    const { methodologyId } = useParams();
    const [methodology, setMethodology] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMethodology = async () => {
            try {
                const response = await fetch("/api/methodology/listDetail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: methodologyId })
                });

                const data = await response.json();
                if (data.status) {
                    setMethodology(data.data);
                    setPdfUrl('https://downloads.1212.mn/' + JSON.parse(data.data?.file_info).pathName || null);
                } else {
                    console.error("Failed to fetch methodology:", data.message);
                }
            } catch (error) {
                console.error("Error fetching methodology:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMethodology();
    }, []);

    const onDownload = () => {
        if (methodology?.pdfUrl) {
            window.open(methodology.pdfUrl, "_blank");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px] w-full">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="nso_container mt-3">
            <div id="methodology" className="__intro_page">
                {methodology && <h2 className='text-2xl font-bold'>{methodology.name}</h2>}

                {methodology && (
                    <ul className="__list_info">
                        <div className="__list_item_date">
                            <div className="__li_f_item">
                                {/* <span className="__title">{t("sector")}:</span> */}
                                <span className="__cont">
                                    {methodology.catalogue?.name}
                                </span>
                            </div>
                            <div className="__li_f_item">
                                <span className="__title pi pi-calendar-times"></span>
                                <span className="__cont">{methodology.approved_date.substr(0, 10)}</span>
                            </div>
                            <div className="__li_f_item">
                                <span className="__title pi pi-eye"></span>
                                <span className="__cont">{methodology.views}</span>
                            </div>
                            {/* <div className="__li_f_item">
                                    <a onClick={onDownload} className="cursor-pointer">
                                        <span className="__title pi pi-download"></span>
                                        <span className="__cont">{t("download")}</span>
                                    </a>
                                </div> */}
                        </div>
                    </ul>
                )}

                {pdfUrl && (
                    <div className="pdf-container w-full h-[800px] overflow-hidden">
                        <PdfViewer fileUrl={pdfUrl} />
                    </div>
                )}
            </div>
        </div>
    );
}
