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

    const myHeaders = new Headers();
    myHeaders.append(
        "Authorization",
        "Bearer " + process.env.BACKEND_KEY
    );

    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
    };

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch(`${process.env.BACKEND_URL}/api/articles/${params.id}?populate=cover&populate=category&populate=language`, requestOptions);

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
                const response = await fetch(`${process.env.BACKEND_URL}/api/articles?populate=cover&populate=category&populate=language`, requestOptions);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const articles = await response.json();
                setSidebar(articles.data);
            } catch (error) {
                console.error('Error fetching articles:', error);
            }
        };

        fetchSideBar();
    }, []);

    return (
        <Layout lng={lng}>
            <div className='nso_main_section'>
                {loading && <div className='nso_about_us'>
                    <div className="nso_container">
                        <Articles article={article} />
                        <ArticleSideBar article={sidebar} />
                    </div>
                </div>}
            </div>
        </Layout>
    );
}
