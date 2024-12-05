"use client"
import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import Layout from '@/components/baseLayout';
import { Paginator } from 'primereact/paginator';
import { useTranslation } from '@/app/i18n/client';

export default function Glossary({ params: { lng } }) {
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

    // Fetch filter counts
    const fetchFilterCount = async (sectorType) => {
        try {
            const response = await fetch(`/api/glossary?sectorType=${sectorType}`);
            const data = await response.json();
            return data.pagination?.total || 0;
        } catch (error) {
            console.error('Error fetching filter count:', error);
            return 0;
        }
    };

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const response = await fetch('/api/glossary/sectors');
                const data = await response.json();
                
                if (data && (Array.isArray(data) || typeof data === 'object')) {
                    const dataArray = Array.isArray(data) ? data : [data];
                    // Transform the data to match the expected format
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

    const fetchGlossaryData = async () => {
        setFilterLoading(true);
        try {
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
        } catch (error) {
            console.error('Error fetching glossary:', error);
            setList([]);
        } finally {
            setLoading(false);
            setFilterLoading(false);
        }
    };

    useEffect(() => {
        fetchGlossaryData();
    }, [first, rows, selectedFilter, lng]);

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        setFirst(0); // Reset to first page
        window.scrollTo(0, 0);
    };

    const onPageChange = (e) => {
        setFirst(e.first);
        setRows(e.rows);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <Layout lng={lng}>
                <div className="nso_about_us mt-40">
                    <div className="nso_container">
                        <div className="flex justify-center items-center min-h-[400px] w-full">
                            <Spin size="large" />
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout lng={lng}>
            <div className="nso_about_us mt-40">
                <div className="nso_container">
                    <div className="sm:col-12 md:col-4 lg:col-3">
                        <div className="nso_cate_section">
                            <div className="__cate_groups get_space">
                                <div className="__filter_sidebar_item">
                                    <span className="filter-title">{t('metadata.sector')}</span>
                                    <ul>
                                        <li
                                            className={`cursor-pointer ${!selectedFilter ? 'active' : ''}`}
                                            onClick={() => handleFilterChange(null)}
                                        >
                                            {t('filter.all')}
                                            <span className="count font-bold">
                                                ({filterList.reduce((sum, item) => sum + item.count, 0)})
                                            </span>
                                        </li>
                                        {filterList.map((item) => (
                                            <li
                                                key={item.sector_type}
                                                className={`cursor-pointer ${selectedFilter?.code === item.code ? 'active' : ''}`}
                                                onClick={() => handleFilterChange(item)}
                                            >
                                                {isMn ? item.name : item.name_eng}
                                                <span className="count font-bold">({item.count})</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="sm:col-12 md:col-8 lg:col-9">
                        <div className="__table_container">
                            <div className="nso_cate_body">
                                <div className="nso_tab">
                                    <div className="nso_tab_content">
                                        {filterLoading ? (
                                            <div className="flex justify-center items-center min-h-[200px]">
                                                <Spin size="large" />
                                            </div>
                                        ) : (
                                            <div className="_group_list">
                                                {list.map((item) => (
                                                    <div key={item.id} className="__list">
                                                        <div className="__table_line"></div>
                                                        <a className="__list_header">
                                                            {isMn ? item.name : item.name_eng}
                                                        </a>
                                                        <div>
                                                            <span className="__list_content">
                                                                {isMn ? item.info : item.info_eng}
                                                            </span>
                                                        </div>
                                                        <div className="__list_details">
                                                            <span className="__list_date">
                                                                <i className="pi pi-calendar-minus"></i>
                                                                {new Date(item.last_modified_date).toISOString().split('T')[0]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {totalRecords > 0 && (
                            <div className="card">
                                <Paginator
                                    first={first}
                                    rows={rows}
                                    totalRecords={totalRecords}
                                    onPageChange={onPageChange}
                                    template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
