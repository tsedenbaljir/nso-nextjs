"use client"
import React, { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';
import Text from '@/components/Loading/Text/Index';
import PdfViewer from '@/components/PdfViewer/index';

import "@/components/styles/news.scss";
import "@/components/styles/dissemination-view.scss";

export default function Home({ params: { lng, id } }) {

    const [article, setArticle] = useState(null);
    const [pdfUrl, setPdfUrl] = useState('');
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await fetch(`/api/dissemination/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    cache: 'no-store',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                if (result.status && result.data) {
                    setArticle(result.data);
                    // Extract PDF URL and text from body
                    const urlMatch = result.data.body.match(/src="([^"]+)"/);
                    const textMatch = result.data.body.match(/<p>(.*?)<\/p>/);
                    if (urlMatch) setPdfUrl(urlMatch[1]);
                    if (textMatch) setText(textMatch[0]);
                }
            } catch (error) {
                console.error('Error fetching article:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id, lng]);

    if (loading) {
        return (
            <>
                <div className='nso_about_us mt-10'>
                    <div className="nso_container">
                        <div className="flex justify-center items-center w-full min-h-[400px]">
                            <Text />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!article) {
        return (
            <>
                <div className='nso_about_us mt-10'>
                    <div className="nso_container">
                        <div className="flex justify-center items-center min-h-[400px]">
                            <h1>{lng === 'mn' ? 'Мэдээлэл олдсонгүй' : 'Article not found'}</h1>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="nso_container">
                <div className="w-full">
                    <div className="__page_block">
                        <div className="wrap_width">
                            <div className="__page_main my-3">
                                <div className="__page_main_header">
                                    <h1 className='text-xl font-bold'>{article.name}</h1>
                                    <em className='mt-3 mb-3'>{article.publishedDate.substr(0, 10)}</em>
                                </div>
                                <div className="__page_main_content">
                                    <div className="__page_main_content_text">
                                        <div id="__one" className="one mt-3 mb-3">
                                            {text && (
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    rehypePlugins={[rehypeRaw]}>
                                                    {text}
                                                </ReactMarkdown>
                                            )}
                                        </div>
                                        {pdfUrl && (
                                            <div className="pdf-container w-full h-[800px] overflow-hidden">
                                                <PdfViewer fileUrl={pdfUrl} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
