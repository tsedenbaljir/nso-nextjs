"use client"
import React, { useState, useEffect } from 'react';
import Path from '@/components/path/Index';
import { useTranslation } from '@/app/i18n/client';

export default function Statistic({ children, params }) {
    const isMn = params.lng;
    const { t } = useTranslation(isMn, "lng", "");

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await fetch(`/api/dissemination/${params.id}`, {
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
                }
            } catch (error) {
                console.error('Error fetching article:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [params.id, params.lng]);

    const breadMap = [
        { label: t('home'), url: [isMn === 'mn' ? '/mn' : '/en'] },
        { label: t('dissemination.title'), url: [(isMn === 'mn' ? '/mn' : '/en') + '/dissemination/future'] },
        { label: t('news.latest'), url: [(isMn === 'mn' ? '/mn' : '/en') + '/dissemination/latest'] },
        { label: !loading ? article.name : <>Уншиж байна...</> }
    ];

    return (
        <>
            <div className="nso_statistic_section">
                <Path name={t('dissemination.title')} breadMap={breadMap} />
                <div className="nso_container">
                    <div className="__statistic_groups w-full">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
