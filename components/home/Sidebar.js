"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Sidebar({ t, lng }) {
    const [indicators, setIndicatos] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchLawsByType();
    }, []);

    const fetchLawsByType = async () => {
        try {
            const response = await fetch(`/api/mainIndicators?type=main`);
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
                <Link href={`${process.env.FRONTEND}/${lng}/` + indicators[3]?.tableau || ""} target='blank' className="__card">
                    <span className="__icon"
                        style={{
                            backgroundImage: `url(${process.env.FRONTEND}/uploads/images/'${indicators[3]?.image}')`,
                        }}
                    ></span>
                    <span className="__desc">{indicators[3]?.updated_date.substring(0, 10) || "..."}</span>
                    <span className="__name">{lng === "mn" ? indicators[3]?.name : indicators[3]?.nameEng || "..."}</span>
                    <div className="__phone">
                        <span style={{ marginTop: 10, fontSize: 18 }}>{indicators[3]?.indicator.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") || "..."} </span>
                        <div className="ng-star-inserted">
                            {indicators[3]?.indicator_perc <= 0 ? <span className="text-lg">{indicators[3]?.indicator_perc.toFixed(1) || "..."}%</span> : <span className="success">{indicators[3]?.indicator_perc.toFixed(1) || "..."}%</span>}
                        </div>
                    </div>
                </Link>
                <Link href={`${process.env.FRONTEND}/${lng}/` + indicators[2]?.tableau || ""} target='blank' className="__card">
                    <span className="__icon"
                        style={{
                            backgroundImage: `url(${process.env.FRONTEND}/uploads/images/'${indicators[2]?.image}')`,
                        }}
                    ></span>
                    <span className="__desc">{indicators[2]?.updated_date.substring(0, 10) || "..."}</span>
                    <span className="__name">{lng === "mn" ? indicators[2]?.name : indicators[2]?.nameEng || "..."}</span>
                    <div className="__phone">
                        <span style={{ marginTop: 10, fontSize: 18 }}>{indicators[2]?.phone} </span>
                        <div className="ng-star-inserted">
                            <span className="text-lg">{indicators[2]?.indicator.toFixed(1) || "..."}%</span>
                        </div>
                    </div>
                </Link>
                <Link href={`${process.env.FRONTEND}/${lng}/` + indicators[1]?.tableau || ""} target='blank' className="__card">
                    <span className="__icon"
                        style={{
                            backgroundImage: `url(${process.env.FRONTEND}/uploads/images/'${indicators[1]?.image}')`,
                        }}
                    ></span>
                    <span className="__desc">{indicators[1]?.updated_date.substring(0, 10) || "..."}</span>
                    <span className="__name">{lng === "mn" ? indicators[1]?.name : indicators[1]?.nameEng || "..."}</span>
                    <div className="__phone">
                        <span style={{ marginTop: 10, fontSize: 14 }}>{indicators[1]?.indicator.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") || "..."} {lng === "mn" ? indicators[1]?.info : indicators[1]?.infoEng} </span>
                        <div className="ng-star-inserted">
                            {indicators[1]?.indicator_perc <= 0 ? <span className="text-lg">{indicators[1]?.indicator_perc.toFixed(1) || "..."}%</span> : <span className="success">{indicators[1]?.indicator_perc.toFixed(1) || "..."}%</span>}
                        </div>
                    </div>
                </Link>
                <Link href={`${process.env.FRONTEND}/${lng}/` + indicators[0]?.tableau || ""} target='blank' className="__card">
                    <span className="__icon"
                        style={{
                            backgroundImage: `url(${process.env.FRONTEND}/uploads/images/'${indicators[0]?.image}')`,
                        }}
                    ></span>
                    <span className="__desc">{indicators[0]?.updated_date.substring(0, 10) || "..."}</span>
                    <span className="__name">{lng === "mn" ? indicators[0]?.name : indicators[0]?.nameEng || "..."}</span>
                    <div className="__phone">
                        <span style={{ marginTop: 10, fontSize: 18 }}>{indicators[0]?.phone} </span>
                        <div className="ng-star-inserted">
                            <span className="text-lg">{indicators[0]?.indicator.toFixed(1) || "..."}%</span>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
