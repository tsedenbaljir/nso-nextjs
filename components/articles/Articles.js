"use client"
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function Articles({ article }) {
    const [imageError, setImageError] = useState(false);

    if (!article) {
        return <div>No article data available</div>;
    }

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://www.1212.mn/images/default.jpg';
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/uploads/')) return `https://www.1212.mn/${imagePath}`;
        return `https://www.1212.mn/uploads/${imagePath}`;
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const formatDate = (dateString) => {
        try {
            return dateString?.substr(0, 10) || 'Date not available';
        } catch (error) {
            return 'Date not available';
        }
    };

    return (
        <article className="__about_post">
            <div className="__info_detail_page">
                <div className="bg-gray">
                    <img
                        src={imageError ? `https://www.1212.mn/uploads/${article.header_image}` : getImageUrl(article.header_image)}
                        alt={article.name || 'Article image'}
                        width={500}
                        height={500}
                        className="__header_image"
                        onError={handleImageError}
                    />
                </div>

                <div className='__view_comments'>
                    <div className="__info">
                        <i className="pi pi-calendar-minus" aria-hidden="true"></i>
                        <span className="ml-2">{formatDate(article.created_date)}</span>
                    </div>
                </div>

                <h1 className="__post_title mt-3">
                    {article.name}
                </h1>

                <div className="border-b border-blue-700 p-2 mb-3" />

                <div className="__info">
                    <div className="__social">
                        <div className="one">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                            >
                                {article.body || 'No content available'}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
