"use client"
import React, { useState, useEffect } from 'react';
import "@/components/styles/news.scss";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from "next/navigation";
import Layout from '@/components/baseLayout';
import Articles from '@/components/articles/Articles';

export default function Home({ params: { lng }, params }) {
    const router = useRouter();
    const [article, setAritcles] = useState([]);
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
    }, []);
    return (
        <Layout lng={lng}>
            <div className='nso_main_section'>
                {loading && <div className='nso_about_us'>
                    <div className="nso_container">
                        <div className="__about_post">
                            <div className="__info_detail_page for" >
                                <div>
                                    <img
                                        className="__header_image"
                                        src={process.env.BACKEND_URL + article.cover.formats.large.url}
                                    />
                                </div>
                                <div className="__post_title">
                                    {article.title}
                                </div>
                                <div className="__info">
                                    <div className="__view_comments">
                                        <div className="__info">
                                            {/* <span className="__view"
                                            >1123 */}
                                            {/* <div className='mt-10'> */}
                                            <i className="pi pi-calendar-minus"></i>
                                            12 1212
                                            {/* </div> */}
                                            {/* </span> */}
                                        </div>
                                    </div>
                                    <div className="__social">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {article.Content}
                                            {/* <div
                                                id="__one"
                                                className="one"
                                                dangerouslySetInnerHTML={{ __html: article.Content }}
                                            /> */}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                                <div className="__body"></div>
                            </div>
                        </div>
                        {/*  */}
                        <Articles />
                    </div>
                </div>}
            </div>
        </Layout>
    );
}
