"use client"
import React, { useState, useEffect } from 'react';
import Layout from '@/components/baseLayout';
import { useTranslation } from '@/app/i18n/client';
import { Spin } from 'antd';
import { Paginator } from 'primereact/paginator';

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
    const fetchFilterCount = async (filterCode) => {
        try {
            const response = await fetch(`https://gateway.1212.mn/services/1212/api/public/glossaries/count?language.equals=${lng.toUpperCase()}&sectorType.equals=${filterCode}`);
            const count = await response.json();
            return count;
        } catch (error) {
            console.error('Error fetching filter count:', error);
            return 0;
        }
    };

    // Get total count for "All" filter
    const getAllCount = () => {
        return filterList.reduce((sum, item) => sum + (item.count || 0), 0);
    };

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const response = await fetch('https://gateway.1212.mn/services/spsdm/api/public/sub-classification-codes/list-all/glossaries');
                const data = await response.json();

                // Fetch counts for each filter
                const countsPromises = data.map(async (filter) => {
                    const count = await fetchFilterCount(filter.code);
                    return { ...filter, count };
                });

                const filtersWithCounts = await Promise.all(countsPromises);
                setFilterList(filtersWithCounts.filter(filter => filter.count > 0));
            } catch (error) {
                console.error('Error fetching filters:', error);
            }
        };
        fetchFilters();
    }, [lng]);

    const fetchGlossaryData = async () => {
        setFilterLoading(true);
        try {
            const params = new URLSearchParams({
                size: rows,
                page: Math.floor(first / rows),
                sort: 'name,asc',
                'language.equals': lng.toUpperCase(),
            });

            if (selectedFilter) {
                params.append('sectorType.equals', selectedFilter.code);
            }

            const response = await fetch(`https://gateway.1212.mn/services/1212/api/public/glossaries-or?${params}`);
            const data = await response.json();
            const totalCount = response.headers.get('x-total-count');

            setList(data);
            setTotalRecords(parseInt(totalCount || '0'));
        } catch (error) {
            console.error('Error fetching glossary:', error);
        } finally {
            setLoading(false);
            setFilterLoading(false);
        }
    };

    useEffect(() => {
        fetchGlossaryData();
    }, [first, rows, selectedFilter, lng]);

    const handleFilterChange = async (filter) => {
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
                                            <span className="count font-bold">({getAllCount()})</span>
                                        </li>
                                        {filterList.map((item) => (
                                            <li
                                                key={item.id}
                                                className={`cursor-pointer ${selectedFilter?.code === item.code ? 'active' : ''}`}
                                                onClick={() => handleFilterChange(item)}
                                            >
                                                {isMn ? item.namemn : item.nameen}
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
                                                            {isMn ? item.name : item.nameEng || item.name}
                                                        </a>
                                                        <div>
                                                            <span className="__list_content">
                                                                {isMn ? item.info : item.infoEng || item.info}
                                                            </span>
                                                        </div>
                                                        <div className="__list_details">
                                                            <span className="__list_date">
                                                                <i className="pi pi-calendar-minus"></i>
                                                                {item.lastModifiedDate.substring(0, 10)}
                                                            </span>
                                                            {item.version && (
                                                                <span className="__list_view">
                                                                    <i className="pi pi-tag"></i>
                                                                    {item.version}
                                                                </span>
                                                            )}
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
