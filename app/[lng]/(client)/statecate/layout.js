"use client"
import Layout from '@/components/baseLayout';
import { useTranslation } from '@/app/i18n/client';

export default function Statecate({ params: { lng }, children }) {
    const { t } = useTranslation(lng, "lng", "");
    return (
        <Layout lng={lng}>
            <div className="nso_transparency mt-40 bg-white">
                {children}
            </div>
        </Layout>
    );
}
