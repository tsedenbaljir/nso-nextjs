"use client"
import React, { useState, useEffect } from 'react';
import "@/components/styles/news.scss";
import { useRouter } from "next/navigation";
import Layout from '@/components/baseLayout';
import Articles from '@/components/articles/Articles';
import ArticleSideBar from '@/components/articles/ArticleSideBar';

export default function Home({ params: { lng }, params }) {
    const router = useRouter();
    const [article, setAritcles] = useState([]);
    const [sidebar, setSidebar] = useState([]);
    const [loading, setLoading] = useState(false);

    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow'
    };

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch(`/api/articles/${params.id}`, {
                    ...requestOptions,
                    cache: 'no-store',  // Prevents caching
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const articles = await response.json();
                setAritcles(articles.data);
                setLoading(true);
            } catch (error) {
                console.error('Error fetching articles:', error);
            }
        };

        fetchArticles();
        const fetchSideBar = async () => {
            try {
                const response = await fetch(`/api/articles?page=1&pageSize=12&lng=${lng}&type=latest`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const res = await response.json();
                
                setSidebar(res.data[0]);
            } catch (error) {
                console.error('Error fetching articles:', error);
            }
        };

        fetchSideBar();
    }, []);

    return (
        <Layout lng={lng}>
            {loading && <div className='nso_about_us mt-35'>
                <div className="nso_container">
                    <Articles article={article} />
                    <ArticleSideBar article={sidebar} />
                </div>
            </div>}
            <br />
        </Layout>
    );
}
