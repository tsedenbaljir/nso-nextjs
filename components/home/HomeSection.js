"use client"
import React, { useState, useEffect } from 'react';
import MainSearch from '@/components/Search/MainSearch';
import Result from '@/components/Search/Result';
import Sidebar from '@/components/home/Sidebar';
import { useTranslation } from '@/app/i18n/client';

const HomeSection = ({ lng }) => {
    const { t } = useTranslation(lng, "lng", "");
    const [showResult, setShowResult] = useState(false);
    const [search, setSearching] = useState({});
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    
    return (
        <div className="nso_main_section" style={{ background: 'var(--surface-bk)' }}>
            <div className="nso_container">
                <div className="__home_groups">
                    <div className="__info_area">
                        <div className="__title" >
                            {t("menu.title")}
                        </div>
                        <div className="__main_search current_space">
                            <MainSearch setShowResult={setShowResult} t={t} setSearching={setSearching} setData={setData} setLoading={setLoading} />
                            {search.length > 2 && <Result showResult={showResult} t={t} loading={loading} data={data} lng={lng} />}
                            {/* <i className="p-autocomplete-loader pi pi-spinner pi-spin "></i> */}
                        </div>
                    </div >
                    <Sidebar t={t} lng={lng} />
                </div >
            </div >
        </div >
    );
};

export default HomeSection;
