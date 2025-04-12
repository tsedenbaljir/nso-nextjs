import Link from 'next/link'
import { useTranslation } from '@/app/i18n/client';
import '@/components/styles/not-found.scss'

export default async function NotFound({ params }) {
    const lng = params?.lng || 'en'
    const { t } = useTranslation(lng, "lng", "");

    return (
        <main>
            <div className="notFoundContainer">
                <h1 className="title">{t('404.title', 'Page Not Found')}</h1>
                <p className="description">{t('404.description', 'Sorry, the page you are looking for does not exist.')}</p>
                <Link href={`/${lng}`} className="homeLink">
                    {t('404.backHome', 'Back to Homepage')}
                </Link>
            </div>
        </main>
    )
} 