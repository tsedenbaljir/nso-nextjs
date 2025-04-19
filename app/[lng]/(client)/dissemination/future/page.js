"use client";
import React, { useState, useEffect } from 'react';
import Layout from '@/components/baseLayout';
import Tr from '@/components/dissemination/Tr';
import Main from '@/components/dissemination/Main';
import { useTranslation } from '@/app/i18n/client';
import Text from '@/components/Loading/Text/Index';
import "@/components/styles/dissemination-list.scss";
import Pagination from '@/components/dissemination/Pagination';
import { useRouter, useSearchParams } from "next/navigation";

export default function AboutUs({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");
    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get('page') || 1, 10);

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const articlesPerPage = 10;

    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
    };

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(false);
            try {
                const response = await fetch(`/api/dissemination?page=${page}&pageSize=${articlesPerPage}&lng=${lng}&type=future`, {
                    ...requestOptions,
                    cache: 'no-store',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                if (result.status) {
                    setArticles(result.data);
                    setTotalPages(result.totalPage);
                }
                setLoading(true);
            } catch (error) {
                console.error('Error fetching articles:', error);
            }
        };

        fetchArticles();
    }, [page, lng]);

    return (
        <>
            <Main type="future" lng={lng}>
                <table className="w-full">
                    <thead className=".p-datatable-new-thead">
                        <tr className="__mobile_table">
                            <th style={{ width: "15%" }}>{t('dissemination.scope')}</th>
                            <th style={{ width: "60%" }}>{t('dissemination.specifications')}</th>
                            <th style={{ width: "15%" }}>{t('dissemination.dateDistribution')}</th>
                            <th style={{ width: "10%" }}>{t('dissemination.time')}</th>
                        </tr>
                    </thead>
                    <tbody className="p-datatable-tbody">
                        {loading ? (
                            articles.map((dt, index) => (
                                <Tr key={index} index={index} item={dt} lng={lng} />
                            ))
                    ) : (
                            <tr>
                                <td colSpan="4">
                                    <Text />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="__pagination">
                    <span>
                        {lng === "mn" ? "Нийт: " : "A total of: "}
                        <strong>{totalPages}</strong>
                        {lng === "mn" ? " илэрцээс 10" : " Showing: 10"}
                        {lng === "mn" ? " илэрц үзүүлж байна." : "."}
                        <span className="__pagination_text">
                            *{lng === "mn" ? 'Тухайн цаг үеийн байдлаас шалтгаалж тархаах өдөр цагт өөрчлөлт орно.' : 'Depending on the situation at the time, the day and time of distribution will vary.'}
                        </span>
                    </span>
                    <div className="mt-2">
                        <Pagination page={page} totalPages={totalPages} mainPath="dissemination" path="future" lng={lng} articlesPerPage={articlesPerPage} />
                    </div>
                </div>
            </Main>
        </>
    );
}
