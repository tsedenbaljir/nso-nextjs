'use client';
import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/app/i18n/client';
import LoadingDiv from '@/components/Loading/Text/Index';
import "@/components/styles/statistics-news.scss";

export default function DisseminationHome({ lng }) {
    const { t } = useTranslation(lng, "lng", "");
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDisseminationNews();
    }, [lng]);

    const fetchDisseminationNews = async () => {
        try {
            const response = await fetch(`/api/dissemination/latest?lng=${lng}`, {
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            const result = await response.json();
            if (result.status && Array.isArray(result.data)) {
                setNews(result.data);
            } else {
                console.error('Failed to fetch dissemination news:', result.message);
            }
        } catch (error) {
            console.error('Error fetching dissemination news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageError = (image) => {
        image.src = '/images/image-not-found.png'; // Replace with your default image path
    };

    return (
        <div style={{ background: 'var(--surface-bk3)' }}>
            <div className="nso_container">
                <div className="nso_news_groups">
                    <span className="__section_title font-bold">
                        {t('statCate.statisticalData')}
                    </span>

                    <div className="__news_groups">
                        {loading && <div className='w-[200px]'><LoadingDiv /></div>}
                        {news && news.length > 0 ? (
                            <>
                                <div
                                    className="__main_news"
                                    onClick={() => window.location.href = `/${lng}/dissemination/${news[0].id}`}
                                >
                                    <img
                                        className="__image"
                                        src={`${process.env.FRONTEND}/uploads/images/${news[0].header_image}`}
                                        onError={(e) => handleImageError(e.target)}
                                        alt={news[0].name}
                                    />
                                    <span className="__name">
                                        <div
                                            className="one"
                                            dangerouslySetInnerHTML={{
                                                __html: news[0].name.length > 300
                                                    ? news[0].name.substring(0, 300) + '...'
                                                    : news[0].name
                                            }}
                                        />
                                    </span>
                                    <div className="__info">
                                        <span className="__view">
                                            {news[0].views}
                                            <div style={{ marginLeft: '20px' }}>
                                                <i className="pi pi-calendar-minus" />
                                                {news[0].published_date.substring(0, 10)}
                                            </div>
                                        </span>
                                    </div>
                                </div>

                                <div className="__other_news">
                                    {news.slice(1).map((newsItem) => (
                                        <div key={newsItem.id}>
                                            <div
                                                className="__card"
                                                onClick={() => window.location.href = `/${lng}/dissemination/${newsItem.id}`}
                                                style={{ marginTop: '20px' }}
                                            >
                                                <img
                                                    src={`${process.env.FRONTEND}/uploads/images/${newsItem.thumb_image}`}
                                                    alt="news"
                                                    onError={(e) => handleImageError(e.target)}
                                                />
                                                <div className="__other">
                                                    <span
                                                        className="__name"
                                                        dangerouslySetInnerHTML={{
                                                            __html: newsItem.name.length > 200
                                                                ? newsItem.name.substring(0, 200) + '...'
                                                                : newsItem.name
                                                        }}
                                                    />
                                                    <div className="__info">
                                                        <span className="__view">
                                                            {newsItem.views}
                                                            <div style={{ marginLeft: '20px' }}>
                                                                <i className="pi pi-calendar-minus" />
                                                                {newsItem.published_date.substring(0, 10)}
                                                            </div>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : null}
                    </div>

                    <div className="__action_area">
                        <button
                            className="nso_btn success"
                            onClick={() => window.location.href = `/${lng}/dissemination/latest`}
                        >
                            {lng === 'mn' ? 'Дэлгэрэнгүй' : 'Read More'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
