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
                        <div className="__metadata">
                            <a href="https://data.nso.mn" className="__dock_item leading-4" target="_blank">
                                <img src="/images/metaIcon.png" height="30px" width="30px"
                                    style={{ marginRight: '5px', height: 30 }} />
                                {lng === "mn" ? <>ТӨРИЙН НЭГДСЭН <br /> ӨГӨГДЛИЙН САН</> : <>GOVERNMENT INTEGRATED <br />  DATABASE</>}
                            </a>
                            <a href="https://metadata.nso.mn" className="__dock_item leading-4" target="_blank">
                                <img src="/images/dataIcon.png" height="30px" width="30px"
                                    style={{ marginRight: '5px', height: 30 }} />
                                {lng === "mn" ? <>ТӨРИЙН МЕТА ӨГӨГДЛИЙН <br /> НЭГДСЭН САН</> : <>GOVERNMENT METADATA<br />  DATABASE</>}
                            </a>
                        </div>
                        {/* <div className="__metadataBanner">
                            <a href="http://aanb3.nso.mn/" target="_blank">
                                <img src="/images/aanb3.jpg" height="auto" width="100%" />
                            </a>
                        </div> */}
                    </div >
                    <div className="__metadataphone">
                        <a href="https://data.nso.mn" className="__dock_item" target="_blank">
                            <img src="/images/metaIcon.png" height="30px" width="30px"
                                style={{ marginRight: '9px', height: 30 }} />
                            <span>{lng === "mn" ? <>ТӨРИЙН НЭГДСЭН <br /> ӨГӨГДЛИЙН САН</> : <>GOVERNMENT INTEGRATED <br />  DATABASE</>}</span>
                        </a>
                        <a href="https://metadata.nso.mn" className="__dock_item" target="_blank">
                            <img src="/images/dataIcon.png" height="30px" width="30px"
                                style={{ marginRight: '6px', height: 30 }} />
                            <span>{lng === "mn" ? <>ТӨРИЙН МЕТА ӨГӨГДЛИЙН <br /> НЭГДСЭН САН</> : <>GOVERNMENT METADATA<br />  DATABASE</>}</span>
                        </a>
                    </div>
                    {/* <div className="__metadataBannerphone">
                        <a href="http://aanb3.nso.mn/" target="_blank">
                            <img src="/images/aanb3.jpg" height="auto" width="328px" />
                        </a>
                    </div> */}
                    <Sidebar t={t} lng={lng} />
                    <img className="mb" src="/images/mbBle.png" />
                </div >
            </div >
        </div >
    );
};

export default HomeSection;
