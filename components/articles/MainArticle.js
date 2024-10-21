"use client"
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/components/articles/Pagination';
import Allarticles from '@/components/articles/Allarticles';
import "@/components/styles/latest-list.component.scss";

export default function MainArticle({ name, path }) {
    // search params
    const searchParams = useSearchParams();
    const page = searchParams.get('page') || 1;

    // States
    const [Articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    const articlesPerPage = 12;

    const myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + process.env.BACKEND_KEY);

    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
    };

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.BACKEND_URL}/api/articles?populate=cover&populate=category&populate=language&pagination[page]=${page}&pagination[pageSize]=${articlesPerPage}`, {
                ...requestOptions,
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const articlesData = await response.json();

            setArticles(articlesData.data);
            setTotalPages(articlesData.meta.pagination.pageCount);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching articles:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    return (
        <div className="nso_about_us mt-35">
            <div className="nso_container">
                <div className="__about_post">
                    <div className="__header">
                        <div className="__title">
                            {name}
                        </div>
                    </div>
                    <Allarticles loading={loading} Articles={Articles} />
                </div>
            </div >
            <div className="nso_container">
                <Pagination page={page} totalPages={totalPages} path={path} />
            </div>
            <br />
        </div>
    );
}
