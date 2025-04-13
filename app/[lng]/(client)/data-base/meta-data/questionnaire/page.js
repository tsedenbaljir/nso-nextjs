"use client"
import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import Path from '@/components/path/Index';
import { useTranslation } from '@/app/i18n/client';
import GlossaryList from '@/components/Glossary/GlossaryList';
import Sidebar from '../sidebar';

export default function Glossary({ params: { lng }, searchParams }) {
    const { t } = useTranslation(lng, "lng", "");

    const [list, setList] = useState([]);
    const [rows, setRows] = useState(10);
    const [first, setFirst] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [filterLoading, setFilterLoading] = useState(false);

    const isMn = lng === 'mn';

    const breadMap = [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('statistic'), url: [(lng === 'mn' ? '/mn' : '/en') + '/statcate'] },
        { label: t('metadata.title') }
    ];

    // Fetch data based on search or normal view
    useEffect(() => {
        const fetchData = async () => {
            setFilterLoading(true);
            try {
                if (searchParams?.search) {
                    // If search parameter exists, use search API
                    const response = await fetch(`/api/questionnaire/search?search=${searchParams.search}&lng=${lng}`);
                    const data = await response.json();

                    if (data.status) {
                        setList(Array.isArray(data.data) ? data.data : [data.data]);
                        setTotalRecords(data.data.length);
                    }
                } else {
                    // Normal glossary view
                    const params = new URLSearchParams({
                        page: Math.floor(first / rows),
                        pageSize: rows
                    });

                    const response = await fetch(`/api/questionnaire?${params}`);
                    const data = await response.json();
                    console.log(data);

                    if (data.status) {
                        setList(Array.isArray(data.data) ? data.data : []);
                        setTotalRecords(data.pagination.total);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setList([]);
                setTotalRecords(0);
            } finally {
                setLoading(false);
                setFilterLoading(false);
            }
        };

        fetchData();
    }, [searchParams?.search, first, rows, lng]);

    const onPageChange = (e) => {
        if (searchParams?.search) return; // Disable pagination during search
        setFirst(e.first);
        setRows(e.rows);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <>
                <div className="nso_about_us mt-40">
                    <div className="nso_container">
                        <div className="flex justify-center items-center min-h-[400px] w-full">
                            <Spin size="large" />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="nso_statistic_section">
                <Path name={t('metadata.title')} breadMap={breadMap} />
                <div className="nso_container mt-4">
                    <div className="sm:col-12 md:col-4 lg:col-3">
                        <Sidebar lng={lng} />
                    </div>
                    <div className="sm:col-12 md:col-8 lg:col-9">
                        <GlossaryList
                            filterLoading={filterLoading}
                            list={list}
                            isMn={isMn}
                            searchParams={searchParams}
                            totalRecords={totalRecords}
                            first={first}
                            rows={rows}
                            onPageChange={onPageChange}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
