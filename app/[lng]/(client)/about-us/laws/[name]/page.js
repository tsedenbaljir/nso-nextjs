"use client"
import React, { useState, useEffect, use } from 'react';
import { useTranslation } from '@/app/i18n/client';
import Text from '@/components/Loading/Text/Index';
import MainBody from '@/components/laws/MainBody';
import ContactSourceCard from '@/components/contact/ContactSourceCard';
import { useRouter, usePathname } from 'next/navigation'
import '@/components/styles/contact-us.scss';
import '@/components/styles/laws.scss';

export default function Home(props) {
    const { lng, name } = use(props.params);
    const { t } = useTranslation(lng, "lng", "");
    const router = useRouter();
    const path = usePathname();
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
            const response = await fetch(`/api/laws?type=${name === "main" ? "legal" : name}`, {
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
        setLoading(false);
        fetchArticles();
    }, [name]);

    function direct(segment) {
        router.push(`/${lng}/about-us/laws/${segment}`);
    }

    return (
        <>
            <div className="nso_container">
                <div className="__body">
                    <div className="__menu">
                        <div className="__title">
                            {t('legalMenu.LEGALFUND')}
                        </div>
                        <ul>
                            <li
                                onClick={() => { direct('main') }}
                                className={`${path.includes('main') ? 'active_laws' : ''}`}
                            >
                                {t('legalMenu.Legal')}
                            </li>
                            <li
                                onClick={() => { direct('rules') }}
                                className={`${path.includes('rules') ? 'active_laws' : ''}`}
                            >
                                {t('legalMenu.Rules')}
                            </li>
                            <li
                                onClick={() => { direct('command') }}
                                className={`${path.includes('command') ? 'active_laws' : ''}`}
                            >
                                {t('legalMenu.Command')}
                            </li>
                            <li
                                onClick={() => { direct('documents') }}
                                className={`${path.includes('documents') ? 'active_laws' : ''}`}
                            >
                                {t('legalMenu.Documents')}
                            </li>
                        </ul>
                    </div>
                    <div className="main">
                        <div className="__laws">
                            <div className="__info_detail_page">
                                {
                                    loading ? Articles.length > 0 ? Articles.map((dt) => {
                                        return <MainBody key={dt.id} dt={dt} />
                                    }) : <>
                                        Хоосон байна.
                                    </> : <div className='w-full'>
                                        <Text />
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="nso_container">
                <div className="laws_source_section">
                    <ContactSourceCard lng={lng} sourceKey="lawsSource" />
                </div>
            </div>
        </>
    );
}
