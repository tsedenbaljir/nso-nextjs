"use client"
import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { useTranslation } from '@/app/i18n/client';
import GlossaryFilter from '@/components/Glossary/GlossaryFilter';
import GlossaryList from '@/components/Glossary/GlossaryList';

export default function Glossary({ params: { lng }, searchParams }) {
    const { t } = useTranslation(lng, "lng", "");
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [filterList, setFilterList] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState(null);

    const isMn = lng === 'mn';

    // Fetch filters
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const response = await fetch('/api/glossary/sectors');
                const data = await response.json();
                
                if (data && (Array.isArray(data) || typeof data === 'object')) {
                    const dataArray = Array.isArray(data) ? data : [data];
                    const formattedFilters = dataArray.map(filter => ({
                        ...filter,
                        name: filter.namemn,
                        name_eng: filter.nameen,
                        code: filter.code,
                        count: filter.count || 0
                    }));
                    
                    setFilterList(formattedFilters.filter(filter => filter.count > 0));
                }
            } catch (error) {
                console.error('Error fetching filters:', error);
                setFilterList([]);
            }
        };
        fetchFilters();
    }, [lng]);

    // Fetch data based on search or normal view
    useEffect(() => {
        const fetchData = async () => {
            setFilterLoading(true);
            try {
                if (searchParams?.search) {
                    // If search parameter exists, use search API
                    const response = await fetch(`/api/glossary/search?search=${searchParams.search}&lng=${lng}`);
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

                    if (selectedFilter) {
                        params.append('sectorType', selectedFilter.code);
                    }

                    const response = await fetch(`/api/glossary?${params}`);
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
        if (searchParams?.search) return; // Disable filters during search
        setSelectedFilter(filter);
        setFirst(0);
        window.scrollTo(0, 0);
    };

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
            <div className="nso_about_us mt-40">
                <div className="nso_container">
                    <div className="sm:col-12 md:col-4 lg:col-3">
                        <GlossaryFilter 
                            filterList={filterList}
                            selectedFilter={selectedFilter}
                            handleFilterChange={handleFilterChange}
                            t={t}
                            isMn={isMn}
                        />
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
