"use client"
import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import Sidebar from '../sidebar';
import Path from '@/components/path/Index';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';
import { useMetadata } from '@/utils/contexts/Metadata';
import QuestionnaireFilterObs from '@/components/Questionnaire/QuestionnaireFilterObs';
import QuestionnaireFilterOrgs from '@/components/Questionnaire/QuestionnaireFilterOrgs';
import QuestionnaireFilterLetter from '@/components/Questionnaire/QuestionnaireFilterLetter';

export default function QuestionnaireLayout({ children, params: { lng } }) {
    const searchParams = useSearchParams();
    const { metadata, setMetadata } = useMetadata();
    const { t } = useTranslation(lng, "lng", "");

    const [loading, setLoading] = useState(true);
    const [obsFilterList, setObsFilterList] = useState([]);
    const [orgFilterList, setOrgFilterList] = useState([]);

    const isMn = lng === 'mn';

    const breadMap = [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('statistic'), url: [(lng === 'mn' ? '/mn' : '/en') + '/statcate'] },
        { label: t('metadata.title') }
    ];

    useEffect(() => {
        const fetchObs = async () => {
            try {
                const response = await fetch('/api/questionnaire/obs');
                const data = await response.json();

                if (data && (Array.isArray(data) || typeof data === 'object')) {
                    const dataArray = Array.isArray(data) ? data : [data];
                    const formatted = dataArray.map(filter => ({
                        ...filter,
                        name: filter.namemn,
                        name_eng: filter.nameen,
                        observe_interval: filter.observe_interval,
                        count: filter.count || 0
                    }));

                    setObsFilterList(formatted.filter(filter => filter.count > 0));
                }
            } catch (error) {
                console.error('Error fetching obs filters:', error);
                setObsFilterList([]);
            }
        };
        fetchObs();

        const fetchOrgs = async () => {
            try {
                const response = await fetch('/api/questionnaire/orgs');
                const data = await response.json();
                if (data && (Array.isArray(data) || typeof data === 'object')) {
                    const dataArray = Array.isArray(data) ? data : [data];
                    const formatted = dataArray.map(filter => ({
                        ...filter,
                        name: filter.fullname || 'No name',
                        name_eng: filter.name,
                        id: filter.id,
                        count: filter.total || 0
                    }));

                    setOrgFilterList(formatted);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching org filters:', error);
                setOrgFilterList([]);
            }
        };
        fetchOrgs();
    }, [lng]);

    const handleFilterChange = (filter) => {
        if (searchParams?.search) return;
        setMetadata(filter);
        window.scrollTo(0, 0);
    };

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

    // const breadMap = [
    //     { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
    //     { label: t('statistic'), url: [(lng === 'mn' ? '/mn' : '/en') + '/statcate'] },
    //     { label: t('metadata.title') }
    //   ];`

    return (
        <div className='nso_page_wrap'>
            <Path name={t('metadata.title')} breadMap={breadMap} />
            <div className="nso_container mt-4">
                <div className="sm:col-12 md:col-4 lg:col-3">
                    <Sidebar lng={lng} />
                    <QuestionnaireFilterOrgs
                        filterList={orgFilterList}
                        selectedFilter={metadata}
                        handleFilterChange={handleFilterChange}
                        t={t}
                        isMn={isMn}
                    />
                    <QuestionnaireFilterObs
                        filterList={obsFilterList}
                        selectedFilter={metadata}
                        handleFilterChange={handleFilterChange}
                        t={t}
                        isMn={isMn}
                    />
                    <QuestionnaireFilterLetter
                        filterList={obsFilterList}
                        selectedFilter={metadata}
                        handleFilterChange={handleFilterChange}
                        t={t}
                        isMn={isMn}
                    />
                </div>
                <div className="sm:col-12 md:col-8 lg:col-9">
                    {children}
                </div>
            </div>
        </div>
    );
}
