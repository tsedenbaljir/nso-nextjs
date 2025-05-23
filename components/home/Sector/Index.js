"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/app/i18n/client';

export default function Index({ lng }) {
    const { t } = useTranslation(lng, "lng", "");

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
                                <Link className="__card" href={`/${lng}/statcate/table/Population,%20household/Adminstrative%20units,%20territory`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.populationHousehold')}</span>
                                </Link>
                                <Link className="__card" href={`/${lng}/statcate/table/Industry,%20service/Industry`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.business')}</span>
                                </Link>
                                <Link className="__card" href={`/${lng}/statcate/table/Society%20and%20development/Gender`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.society')}</span>
                                </Link>
                                <Link className="__card" href={`/${lng}/statcate/table/Economy,%20environment/Environment`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.economy')}</span>
                                </Link>
                                <Link className="__card" href={`/${lng}/statcate/table/Education,%20health/Edu main`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.environment')}</span>
                                </Link>
                                <Link className="__card" href={`/${lng}/statcate/table/Labour,%20business/Business%20Register`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.labourForce')}</span>
                                </Link>
                            </div>
                        </div>
                        <div className="__group">
                            <div className="__highlight">
                                <Link className="__card" href={`${process.env.BASE_FRONT_URL}/pxweb/${lng}/${indicators[4]?.tableau}`} target='blank' >
                                    <span className="__desc">{indicators[4]?.updated_date.substring(0, 10) || "..."}</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: `url(https://betanso.nso.mn/uploads/images/${indicators[4]?.image})` }}></span>
                                        {lng === "mn" ? indicators[4]?.name : indicators[4]?.nameEng || "..."}
                                    </span>
                                    <span className="__count">{indicators[4]?.indicator.toFixed(1) || "..."} {lng === "mn" ? indicators[4]?.info : indicators[4]?.infoEng}</span>
                                </Link>
                                <Link className="__card" href={`${process.env.BASE_FRONT_URL}/pxweb/${lng}/${indicators[3]?.tableau}`} target='blank' >
                                    <span className="__desc">{indicators[3]?.updated_date.substring(0, 10) || "..."}</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: `url(https://betanso.nso.mn/uploads/images/${indicators[3]?.image})` }}></span>
                                        {lng === "mn" ? indicators[3]?.name : indicators[3]?.nameEng || "..."}
                                    </span>
                                    <span className="__count">{indicators[3]?.indicator.toFixed(1) || "..."} {lng === "mn" ? indicators[3]?.info : indicators[3]?.infoEng}</span>
                                </Link>
                                <Link className="__card" href={`${process.env.BASE_FRONT_URL}/pxweb/${lng}/${indicators[2]?.tableau}`} target='blank' >
                                    <span className="__desc">{indicators[2]?.updated_date.substring(0, 10) || "..."}</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: `url(https://betanso.nso.mn/uploads/images/${indicators[2]?.image})` }}></span>
                                        {lng === "mn" ? indicators[2]?.name : indicators[2]?.nameEng || "..."}
                                    </span>
                                    <span className="__count">{indicators[2]?.indicator.toFixed(1) || "..."} {lng === "mn" ? indicators[2]?.info : indicators[2]?.infoEng}</span>
                                </Link>
                                <Link className="__card" href={`${process.env.BASE_FRONT_URL}/pxweb/${lng}/${indicators[1]?.tableau}`} target='blank' >
                                    <span className="__desc">{indicators[4]?.updated_date.substring(0, 10) || "..."}</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: `url(https://betanso.nso.mn/uploads/images/${indicators[1]?.image})` }}></span>
                                        {lng === "mn" ? indicators[1]?.name : indicators[1]?.nameEng || "..."}
                                    </span>
                                    <span className="__count">{indicators[1]?.indicator.toFixed(1) || "..."} {lng === "mn" ? indicators[1]?.info : indicators[1]?.infoEng}</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
