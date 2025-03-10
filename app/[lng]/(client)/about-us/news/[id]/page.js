"use client"
import React, { useState, useEffect } from 'react';
import "@/components/styles/news.scss";
import { useRouter } from "next/navigation";
import Articles from '@/components/articles/Articles';
import TextLoading from '@/components/Loading/Text/Index';
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
                const response = await fetch(`/api/articles`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const res = await response.json();

                setSidebar(res.data);
            } catch (error) {
                console.error('Error fetching articles:', error);
            }
        };

        fetchSideBar();
    }, []);

    return (
        <>
            {loading ? <div className='nso_about_us'>
                <div className="nso_container">
                    <Articles article={article} />
                    <ArticleSideBar article={sidebar} />
                </div>
            </div> : <div className='nso_about_us'>
                <div className="nso_container">
                    <TextLoading />
                    <TextLoading />
                </div>
            </div>
            }
            <br />
        </>
    );
}
