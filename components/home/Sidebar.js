"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Sidebar({ t, lng }) {
    const [indicators, setIndicatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    useEffect(() => {
        fetchLawsByType();
    }, []);

    const fetchLawsByType = async () => {
        try {
            const response = await fetch(`/api/mainIndicators?type=main`, { cache: 'no-store' });
            const result = await response.json();

            if (result.status && Array.isArray(result.data)) {
                setIndicatos(result.data)
            }
        } catch (error) {
            console.error('Error fetching laws:', error);
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className="__group">
            <div className="__card_area">
                <div onClick={() => {
                    if (indicators[3]?.tableau) {
                        router.push(`/${lng}/` + indicators[3]?.tableau, '_blank');
                    }
                }} className="__card">
                    <span className="__icon"
                        style={{
                            backgroundImage: `url(/uploads/'${indicators[3]?.image}')`,
                        }}
                    ></span>
                    <span className="__desc">{indicators[3]?.last_modified_date.substring(0, 10) || "..."}</span>
                    <span className="__name">{lng === "mn" ? indicators[3]?.name : indicators[3]?.name_eng || "..."}</span>
                    <div className="__phone">
                        <span style={{ marginTop: 10, fontSize: 18 }}>{indicators[3]?.indicator.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") || "..."} </span>
                        <div className="ng-star-inserted">
                            {indicators[3]?.indicator_perc <= 0 ? <span className="text-lg">{indicators[3]?.indicator_perc.toFixed(1) || "..."}%</span> : <span className="success">{indicators[3]?.indicator_perc.toFixed(1) || "..."}%</span>}
                        </div>
                    </div>
                </div>
                <div onClick={() => {
                    if (indicators[2]?.tableau) {
                        router.push(`/${lng}/` + indicators[2]?.tableau, '_blank');
                    }
                }} className="__card">
                    <span className="__icon"
                        style={{
                            backgroundImage: `url(/uploads/'${indicators[2]?.image}')`,
                        }}
                    ></span>
                    <span className="__desc">{indicators[2]?.last_modified_date.substring(0, 10) || "..."}</span>
                    <span className="__name">{lng === "mn" ? indicators[2]?.name : indicators[2]?.name_eng || "..."}</span>
                    <div className="__phone">
                        <span style={{ marginTop: 10, fontSize: 18 }}>{indicators[2]?.phone} </span>
                        <div className="ng-star-inserted">
                            <span className="text-lg">{indicators[2]?.indicator.toFixed(1) || "..."}%</span>
                        </div>
                    </div>
                </div>
                <div onClick={() => {
                    if (indicators[1]?.tableau) {
                        router.push(`/${lng}/` + indicators[1]?.tableau, '_blank');
                    }
                }} className="__card">
                    <span className="__icon"
                        style={{
                            backgroundImage: `url(/uploads/'${indicators[1]?.image}')`,
                        }}
                    ></span>
                    <span className="__desc">{indicators[1]?.last_modified_date.substring(0, 10) || "..."}</span>
                    <span className="__name">{lng === "mn" ? indicators[1]?.name : indicators[1]?.name_eng || "..."}</span>
                    <div className="__phone">
                        <span style={{ marginTop: 10, fontSize: 14 }}>{indicators[1]?.indicator.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") || "..."} {lng === "mn" ? indicators[1]?.info : indicators[1]?.infoEng} </span>
                        <div className="ng-star-inserted">
                            {indicators[1]?.indicator_perc <= 0 ? <span className="text-lg">{indicators[1]?.indicator_perc.toFixed(1) || "..."}%</span> : <span className="success">{indicators[1]?.indicator_perc.toFixed(1) || "..."}%</span>}
                        </div>
                    </div>
                </div>
                <div onClick={() => {
                    if (indicators[0]?.tableau) {
                        router.push(`/${lng}/` + indicators[0]?.tableau, '_blank');
                    }
                }} className="__card">
                    <span className="__icon"
                        style={{
                            backgroundImage: `url(/uploads/'${indicators[0]?.image}')`,
                        }}
                    ></span>
                    <span className="__desc">{indicators[0]?.last_modified_date.substring(0, 10) || "..."}</span>
                    <span className="__name">{lng === "mn" ? indicators[0]?.name : indicators[0]?.name_eng || "..."}</span>
                    <div className="__phone">
                        <span style={{ marginTop: 10, fontSize: 18 }}>{indicators[0]?.phone} </span>
                        <div className="ng-star-inserted">
                            <span className="text-lg">{indicators[0]?.indicator.toFixed(1) || "..."}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
