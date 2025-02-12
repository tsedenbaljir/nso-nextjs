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
                        <div class="__metadata">
                            <a href="https://data.nso.mn" class="__dock_item leading-4" target="_blank">
                                <img src="/images/metaIcon.png" height="30px" width="30px"
                                    style={{ marginRight: '20px', height: 30 }} />
                                ТӨРИЙН НЭГДСЭН <br /> ӨГӨГДЛИЙН САН
                            </a>
                            <a href="https://metadata.nso.mn" class="__dock_item leading-4" target="_blank">
                                <img src="/images/dataIcon.png" height="30px" width="30px"
                                    style={{ marginRight: '5px', height: 30 }} />
                                ТӨРИЙН МЕТА ӨГӨГДЛИЙН <br /> НЭГДСЭН САН
                            </a>
                        </div>
                    </div >
                    <div class="__metadataphone">
                        <a href="https://data.nso.mn" class="__dock_item" target="_blank">
                            <img src="/images/metaIcon.png" height="30px" width="30px"
                                style={{ marginRight: '9px', height: 30 }} />
                            <span>ТӨРИЙН НЭГДСЭН <br /> ӨГӨГДЛИЙН САН</span>
                        </a>
                        <a href="https://metadata.nso.mn" class="__dock_item" target="_blank">
                            <img src="/images/dataIcon.png" height="30px" width="30px"
                                style={{ marginRight: '6px', height: 30 }} />
                            <span>ТӨРИЙН МЕТА ӨГӨГДЛИЙН <br /> НЭГДСЭН САН</span>
                        </a>
                    </div>
                    <Sidebar t={t} lng={lng} />
                    <img class="mb" src="/images/mbBle.png" />
                </div >
            </div >
        </div >
    );
};

export default HomeSection;
