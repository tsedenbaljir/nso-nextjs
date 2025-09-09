"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { PanelMenu } from "primereact/panelmenu";
import { useTranslation } from '@/app/i18n/client';
import Result from '@/components/Search/subMain/Result';
import MainSearch from '@/components/Search/subMain/MainSearch';
import LoadingDiv from '@/components/Loading/Text/Index';

export default function SideBar({ lng }) {
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
                label: t('statCate.methodologyText'),
                id: 'group',
                items: [
                    {
                        label: t('statCate.methodologyText'),
                        id: 'list',
                        className: path.includes('list') ? 'active-link' : '',
                        command: () => {
                            router.push(`/${lng}/methodology/list`);
                        }
                    },
                    {
                        label: t('metadata.classificationcode'),
                        id: 'classification',
                        className: path.includes('classification') ? 'active-link' : '',
                        command: () => {
                            router.push(`/${lng}/methodology/classification`);
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

            {menuItems.length === 0 ? (
                <div className="text-center py-4">
                    <LoadingDiv />
                    <br />
                </div>
            ) : (
                <PanelMenu model={menuItems} className="mt-10 w-full nso_cate_selection border-r border-gray-200" />
            )}
        </div>
    );
}
