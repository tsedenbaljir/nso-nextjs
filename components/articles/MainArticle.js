"use client"
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/components/articles/Pagination';
import Allarticles from '@/components/articles/Allarticles';
import "@/components/styles/latest-list.component.scss";

export default function MainArticle({ name, path, mainPath, lng }) {
    // search params
    const searchParams = useSearchParams();
    const page = searchParams.get('page') || 1;

    // States
    const [Articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    const articlesPerPage = 12;

    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow'
    };

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/articles?page=${page}&pageSize=${articlesPerPage}&lng=${lng}&type=${path}`, {
                ...requestOptions,
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const articlesData = await response.json();

            setArticles(articlesData.data);
            setTotalPages(articlesData.pagination.total);
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
        <>
            <div className="nso_container">
                <div className="__about_post_cr">
                    <div className="__header">
                        <div className="__title">
                            {name}
                        </div>
                    </div>
                    <Allarticles loading={loading} Articles={Articles} mainPath={mainPath}/>
                </div>
            </div >
            <div className="nso_container">
                <Pagination page={parseInt(page)} mainPath={mainPath} articlesPerPage={articlesPerPage} totalPages={totalPages} path={path} lng={lng} />
            </div>
            <br />
        </>
    );
}
