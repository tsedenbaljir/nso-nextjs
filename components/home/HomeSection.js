"use client"
import React, { useState, useEffect } from 'react';
import MainSearch from '@/components/home/Search/MainSearch';
import Result from '@/components/home/Search/Result';
import Sidebar from '@/components/home/Sidebar';
import { useTranslation } from '@/app/i18n/client';

const HomeSection = ({ lng }) => {
    const { t } = useTranslation(lng, "lng", "");
    const [showResult, setShowResult] = useState(false);
    return (
        <div className="nso_main_section" style={{ background: 'var(--surface-bk)' }}>
            <div className="nso_container">
                <div className="__home_groups">
                    <div className="__info_area">
                        <div className="__title" >
                            {t("nsoTitle")}
                        </div>
                        <div className="__main_search current_space">
                            <MainSearch setShowResult={setShowResult} t={t} />
                            <Result showResult={showResult} t={t} />
                            {/* <i className="p-autocomplete-loader pi pi-spinner pi-spin "></i> */}
                        </div>
                    </div >
                    <Sidebar t={t} />
                </div >
            </div >
        </div >
    );
};

export default HomeSection;
