"use client"
import Link from 'next/link'
import { useTranslation } from '@/app/i18n/client';
import '@/components/styles/not-found.scss'

export default function NotFound({ params }) {
    const { t } = useTranslation(params?.lng || 'en');

    return (
        <main>
            <div className="notFoundContainer">
                <div className="errorCode">
                    {t('404.errorCode')}
                </div>
                <h1 className="title">{t('404.title')}</h1>
                <p className="description">{t('404.description')}</p>
                <div className="actions">
                    <Link href={`/${params?.lng || 'en'}`} className="homeLink">
                        {t('404.backHome')}
                    </Link>
                    <button 
                        onClick={() => window.history.back()} 
                        className="backButton"
                    >
                        {t('404.goBack')}
                    </button>
                </div>
            </div>
        </main>
    )
} 