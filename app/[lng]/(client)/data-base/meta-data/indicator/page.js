"use client"
import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import Path from '@/components/path/Index';
import { useTranslation } from '@/app/i18n/client';
import GlossaryList from '@/components/Glossary/GlossaryList';
import QuestionnaireFilterLetter from '@/components/Questionnaire/QuestionnaireFilterLetter';
import Sidebar from '../sidebar';

export default function Glossary({ params: { lng }, searchParams }) {
    const { t } = useTranslation(lng, "lng", "");
    
    const [list, setList] = useState([]);
    const [rows, setRows] = useState(10);
    const [first, setFirst] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [filterLoading, setFilterLoading] = useState(false);
    const [filterList, setFilterList] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState(null);

    const isMn = lng === 'mn';

    const breadMap = [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('statistic'), url: [(lng === 'mn' ? '/mn' : '/en') + '/statcate'] },
        { label: t('metadata.title') }
    ];
    useEffect(() => {
        const fetchData = async () => {
            setFilterLoading(true);
            try {
                if (searchParams?.search) {
                    const response = await fetch(`/api/indicator/search?search=${searchParams.search}&lng=${lng}`);
                    const data = await response.json();

                    if (data.status) {
                        setList(Array.isArray(data.data) ? data.data : [data.data]);
                        setTotalRecords(data.data.length);
                    }
                } else {
                    const params = new URLSearchParams({
                        page: Math.floor(first / rows),
                        pageSize: rows
                    });

                    console.log("selectedFilter", selectedFilter);

                    if (selectedFilter) {
                        params.append('label', selectedFilter); 
                    }

                    console.log("params", params.toString(), selectedFilter);

                    const response = await fetch(`/api/indicator?${params}`);
                    const data = await response.json();
                    
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
    }, [searchParams?.search, first, rows, selectedFilter, lng]);

    const handleFilterChange = (filter) => {
        if (searchParams?.search) return;
        setSelectedFilter(filter);
        setFirst(0);
        window.scrollTo(0, 0);
    };

    const onPageChange = (e) => {
        if (searchParams?.search) return; 
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
                <div className="nso_container">
                    <div className="sm:col-12 md:col-4 lg:col-3">
                        <br/>
                        <Sidebar lng={lng} />
                            <QuestionnaireFilterLetter
                               filterList={filterList}
                               selectedFilter={selectedFilter}
                               handleFilterChange={handleFilterChange}
                               t={t}
                               isMn={isMn}
                            />
                    </div>
                    <div className="sm:col-12 md:col-8 lg:col-9">
                        <GlossaryList
                            path={"indicator"}
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
