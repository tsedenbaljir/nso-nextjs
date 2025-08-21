"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';

export default function Index({ lng }) {
    const { t } = useTranslation(lng, "lng", "");
    const router = useRouter();
    const [indicators, setIndicatos] = useState([]);

    useEffect(() => {
        fetchLawsByType();
    }, []);

    const fetchLawsByType = async () => {
        try {
            const response = await fetch(`/api/mainIndicators?type=body`);
            const result = await response.json();
            if (result.status && Array.isArray(result.data)) {
                setIndicatos(result.data)
            }
        } catch (error) {
            console.error('Error fetching laws:', error);
        }
    };
    return (
        <>
            <div className="nso_home_statistic">
                <div className="nso_container">
                    <span className="__group_title">Статистик</span>
                </div>
                <div className="nso_container">
                    <div className="__statistic_groups">
                        <div className="__group">
                            <div className="__statistics">
                                <Link className="__card" href={`/${lng}/statcate/table/Population,%20household/1_Population,%20household`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.populationHousehold')}</span>
                                </Link>
                                <Link className="__card" href={`/${lng}/statcate/table/Industry,%20service/Industry`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.business')}</span>
                                </Link>
                                <Link className="__card" href={`/${lng}/statcate/table/Society,%20development/Disability`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.society')}</span>
                                </Link>
                                <Link className="__card" href={`/${lng}/statcate/table/Economy,%20environment/Environment`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.economy')}</span>
                                </Link>
                                <Link className="__card" href={`/${lng}/statcate/table/Education,%20health/Births,%20deaths`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.environment')}</span>
                                </Link>
                                <Link className="__card" href={`/${lng}/statcate/table/Labour,%20business/Civil%20servants`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.labourForce')}</span>
                                </Link>
                            </div>
                        </div>
                        <div className="__group">
                            <div className="__highlight">
                                <div className="__card" onClick={() => {
                                    if (indicators[4]?.tableau) {
                                        router.push(`/${lng}/${indicators[4]?.tableau}`, '_blank');
                                    }
                                }}>
                                    <span className="__desc">{indicators[4]?.last_modified_date.substring(0, 10) || "..."}</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: `url(/uploads/${indicators[4]?.image})` }}></span>
                                        {lng === "mn" ? indicators[4]?.name : indicators[4]?.name_eng || "..."}
                                    </span>
                                    <span className="__count">{indicators[4]?.indicator.toFixed(1) || "..."} {lng === "mn" ? indicators[4]?.info : indicators[4]?.infoEng}</span>
                                </div>
                                <div className="__card" onClick={() => {
                                    if (indicators[3]?.tableau) {
                                        router.push(`/${lng}/${indicators[3]?.tableau}`, '_blank');
                                    }
                                }}>
                                    <span className="__desc">{indicators[3]?.last_modified_date.substring(0, 10) || "..."}</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: `url(/uploads/${indicators[3]?.image})` }}></span>
                                        {lng === "mn" ? indicators[3]?.name : indicators[3]?.name_eng || "..."}
                                    </span>
                                    <span className="__count">{indicators[3]?.indicator.toFixed(1) || "..."} {lng === "mn" ? indicators[3]?.info : indicators[3]?.infoEng}</span>
                                </div>
                                <div className="__card" onClick={() => {
                                    if (indicators[2]?.tableau) {
                                        router.push(`/${lng}/${indicators[2]?.tableau}`, '_blank');
                                    }
                                }}>
                                    <span className="__desc">{indicators[2]?.last_modified_date.substring(0, 10) || "..."}</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: `url(/uploads/${indicators[2]?.image})` }}></span>
                                        {lng === "mn" ? indicators[2]?.name : indicators[2]?.name_eng || "..."}
                                    </span>
                                    <span className="__count">{indicators[2]?.indicator.toFixed(1) || "..."} {lng === "mn" ? indicators[2]?.info : indicators[2]?.infoEng}</span>
                                </div>
                                <div className="__card" onClick={() => {
                                    if (indicators[1]?.tableau) {
                                        router.push(`/${lng}/${indicators[1]?.tableau}`, '_blank');
                                    }
                                }}>
                                    <span className="__desc">{indicators[1]?.last_modified_date.substring(0, 10) || "..."}</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: `url(/uploads/${indicators[1]?.image})` }}></span>
                                        {lng === "mn" ? indicators[1]?.name : indicators[1]?.name_eng || "..."}
                                    </span>
                                    <span className="__count">{indicators[1]?.indicator?.toFixed(1) || "..."} {lng === "mn" ? indicators[1]?.info : indicators[1]?.infoEng}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
