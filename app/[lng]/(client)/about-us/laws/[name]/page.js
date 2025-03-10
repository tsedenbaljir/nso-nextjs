"use client"
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/client';
import Text from '@/components/Loading/Text/Index';
import MainBody from '@/components/laws/MainBody';
import '@/components/styles/laws.scss';

export default function Home({ params: { lng }, params }) {
    const { t } = useTranslation(lng, "lng", "");

    // States
    const [Articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);

    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow'
    };

    const fetchArticles = async () => {
        try {
            const response = await fetch(`/api/laws?type=${params.name}`, {
                ...requestOptions,
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const articlesData = await response.json();

            setArticles(articlesData.data);
            setLoading(true);
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
                <div className="__body">
                    <div className="__menu">
                        <div className="__title">
                            {t('legalMenu.LEGALFUND')}
                        </div>
                        <div className="main">
                            <div className="__laws">
                                <div className="__info_detail_page">
                                    {
                                        loading ? Articles.map((dt) => {
                                            return <MainBody dt={dt} />
                                        }) : <div className='w-full'>
                                            <Text />
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
