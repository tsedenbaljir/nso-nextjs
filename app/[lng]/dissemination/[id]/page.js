"use client"
import React, { useState, useEffect } from 'react';
import "@/components/styles/news.scss";
import Layout from '@/components/baseLayout';
import PdfViewer from '@/components/PdfViewer';
import "@/components/styles/dissemination-view.scss";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function Home({ params: { lng }, params }) {
    const [article, setAritcles] = useState([]);
    const [pdfUrl, setPdfUrl] = useState([]);
    const [text, setText] = useState([]);

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
                const urlMatch = articles.data.body.match(/src="([^"]+)"/);
                const text = articles.data.body.match(/<p>(.*?)<\/p>/);
                setText(text[0])
                setPdfUrl(urlMatch[1])
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
            {loading && <div className='nso_about_us mt-10'>
                <div className="nso_container">
                    <div className="nso_page_content_wrap">
                        <div className="__page_block">
                            <div className="wrap_width">
                                <div className="__page_main">
                                    <div className="__page_main_header">
                                        <h1 className='text-xl font-bold'>{article.name}</h1>
                                        <em className=' mt-3 mb-3'>{article.published_date.substr(0, 10)}</em>
                                    </div>
                                    <div className="__page_main_content">
                                        <div className="__page_main_content_text">
                                            <div
                                                id="__one"
                                                className="one mt-3 mb-3"
                                            >
                                                {text && <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    rehypePlugins={[rehypeRaw]}>
                                                    {text}
                                                </ReactMarkdown>}
                                            </div >
                                            <div className="w-full h-[800px] overflow-hidden">
                                                {pdfUrl && <PdfViewer pdfUrl={pdfUrl} />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
            <br />
        </Layout>
    );
}
