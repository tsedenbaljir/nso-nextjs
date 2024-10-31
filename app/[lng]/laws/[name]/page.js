"use client"
import React, { useState, useEffect } from 'react';
import Layout from '@/components/baseLayout';
import { useRouter } from "next/navigation";
import { useTranslation } from '@/app/i18n/client';
import '@/components/styles/laws.scss';

export default function Home({ params: { lng }, params }) {
    const { t } = useTranslation(lng, "lng", "");
    const router = useRouter();

    // States
    const [Articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow'
    };

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/laws?type=${params.name}`, {
                ...requestOptions,
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const articlesData = await response.json();

            setArticles(articlesData.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching articles:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const body = (dt) => {
        return <div
            className="__post"
            target="blank"
            onClick={() => {
                router.push("https://downloads.1212.mn/" + JSON.parse(dt.file_info).pathName);
            }}
        >
            <img
                src="/images/about_us/pdf-logo.png"
                style={{ width: "36px", height: "47px" }}
            />
            <div className="__laws-body">
                <div className="__title">
                    {dt.name}
                </div>
                <div className="__view_comments mt-3">
                    <span className="__date text-gray-5 text-sm">{dt.created_date.substr(0, 10)}</span>
                </div>
            </div>
            <img
                className="__download_cloud"
                src="/images/about_us/download-cloud.png"
            />
        </div>
    }

    return (
        <Layout lng={lng}>
            <div className="nso_about_us mt-40">
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
                                            Articles.map((dt) => {
                                                return body(dt)
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout >
    );
}
