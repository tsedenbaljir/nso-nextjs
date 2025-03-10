"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import Path from '@/components/path/Index';
import { useTranslation } from '@/app/i18n/client';
import Sidebar from '../../sidebar';

export default function Glossary({ params: { lng, id } }) {
    const router = useRouter();
    
    const { t } = useTranslation(lng, "lng", "");

    const [list, setList] = useState({});
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);

    const breadMap = [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('statistic'), url: [(lng === 'mn' ? '/mn' : '/en') + '/statcate'] },
        { label: t('metadata.title') }
    ];

    // Fetch data when `id` or `lng` changes
    useEffect(() => {
        if (!id) return; // Ensure id is present

        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/indicator`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id })
                });
                const data = await response.json();
                console.log(data);

                if (data.status) {
                    setList(data.data);
                    setTotalRecords(data.pagination?.total || 0);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setList({});
                setTotalRecords(0);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, lng]); // Depend on `id` and `lng` to refetch when they change

    if (loading) {
        return (
            <div className="nso_about_us mt-40">
                <div className="nso_container">
                    <div className="flex justify-center items-center min-h-[400px] w-full">
                        <Spin size="large" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="nso_statistic_section">
            <Path name={t('metadata.title')} breadMap={breadMap} />
            <div className="nso_container">
                <div className="sm:col-12 md:col-4 lg:col-3">
                    <br />
                    <Sidebar lng={lng} />
                </div>
                <div className="sm:col-12 md:col-8 lg:col-9">
                    {list && list.metadata && (
                        <div className="__info_detail_page">
                            {/* Detail components and mapping like previously detailed */}
                            {/* Assuming MetaItem component is defined elsewhere or is simple enough to implement */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
