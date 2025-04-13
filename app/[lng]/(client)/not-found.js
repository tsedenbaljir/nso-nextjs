"use client"
import Link from 'next/link'
import { useTranslation } from '@/app/i18n/client';
import '@/components/styles/not-found.scss'

export default function NotFound({ params }) {
    const { t } = useTranslation(params?.lng || 'en');

    return (
        <main>
            <div className="notFoundContainer">
                <h1 className="title">{t('404.title', 'Page Not Found')}</h1>
                <p className="description">{t('404.description', 'Sorry, the page you are looking for does not exist.')}</p>
                <Link href={`/${params?.lng || 'en'}`} className="homeLink">
                    {t('404.backHome', 'Back to Homepage')}
                </Link>
            </div>
        </main>
    )
} 