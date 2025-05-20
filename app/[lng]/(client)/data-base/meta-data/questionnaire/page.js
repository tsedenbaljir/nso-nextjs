"use client"
import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { useTranslation } from '@/app/i18n/client';
import { useMetadata } from '@/utils/contexts/Metadata';
import QuestionnaireList from '@/components/Questionnaire/QuestionnaireList';

export default function Questionnaire({ params: { lng }, searchParams }) {
    const { t } = useTranslation(lng, "lng", "");
    const { metadata } = useMetadata();

    const [list, setList] = useState([]);
    const [rows, setRows] = useState(10);
    const [first, setFirst] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [filterLoading, setFilterLoading] = useState(false);

    const isMn = lng === 'mn';

    useEffect(() => {
        const fetchData = async () => {
            setFilterLoading(true);
            try {
                if (searchParams?.search) {
                    const response = await fetch(`/api/questionnaire/search?search=${searchParams.search}&lng=${lng}`);
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

                    if (metadata) {
                        if (typeof metadata === 'object') {
                            if (metadata.observe_interval) {
                                params.append('interval', metadata.observe_interval);
                            }
                            if (metadata.id) {
                                params.append('orgId', metadata.id);
                            }
                        } else if (typeof metadata === 'string') {
                            params.append('label', metadata);
                        }
                    }

                    const response = await fetch(`/api/questionnaire?${params}`);
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
    }, [searchParams?.search, first, rows, metadata, lng]);

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
        <QuestionnaireList
            path={"questionnaire"}
            filterLoading={filterLoading}   
            list={list}
            isMn={isMn}
            searchParams={searchParams}
            totalRecords={totalRecords}
            first={first}
            rows={rows}
            onPageChange={onPageChange}
        />
    );
}
