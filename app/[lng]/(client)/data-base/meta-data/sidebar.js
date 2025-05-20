"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { PanelMenu } from "primereact/panelmenu";
import { useTranslation } from '@/app/i18n/client';
import Result from '@/components/Search/subMain/Result';
import MainSearch from '@/components/Search/subMain/MainSearch';

export default function SideBar({ lng, setActiveLetter }) {
    const router = useRouter();
    const path = usePathname();
    const { t } = useTranslation(lng, "lng", "");
    
    const [menuItems, setMenuItems] = useState([]);

    const [showResult, setShowResult] = useState(false);
    const [search, setSearching] = useState({});
    const [data, setData] = useState({});
    const [loadingSearch, setLoadingSearch] = useState(true);
    useEffect(() => {
        setMenuItems([
            {
                label: 'Бүлэг',
                id: 'group',
                items: [
                    {
                        label: 'Мэдээ, тооллого, судалгаа',
                        id: 'questionnaire',
                        className: path.includes('questionnaire') ? 'active-link' : '',
                        command: () => {
                            router.push(`/${lng}/data-base/meta-data/questionnaire`);
                        }
                    },
                    {
                        label: 'Үзүүлэлт',
                        id: 'indicator',
                        className: path.includes('indicator') ? 'active-link' : '',
                        command: () => {
                            router.push(`/${lng}/data-base/meta-data/indicator`);
                        }
                    },
                    {
                        label: 'Нэр, томьёоны тайлбар',
                        id: 'glossary',
                        className: path.includes('glossary') ? 'active-link' : '',
                        command: () => {
                            router.push(`/${lng}/data-base/meta-data/glossary`);
                        }
                    },
                ],
                className: '',
                expanded: true
            }
        ]);
    }, [path]);

    return (
        <div className='pb-15'>
            <div className="__cate_search -mt-5">
                <div className="__main_search">
                    <MainSearch setShowResult={setShowResult} t={t} setSearching={setSearching} setData={setData} setLoading={setLoadingSearch} />
                    {search.length > 2 && <Result type={5} showResult={showResult} t={t} loading={loadingSearch} data={data} lng={lng} />}
                </div>
            </div>
            <PanelMenu model={menuItems} className="mt-10 w-full nso_cate_selection border-r border-gray-200" />
        </div>
    );
}
