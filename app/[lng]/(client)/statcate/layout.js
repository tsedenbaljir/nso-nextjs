"use client";

import Path from '@/components/path/Index';
import { useTranslation } from '@/app/i18n/client';

export default function Statecate({ children, params }) {
    const { lng } = params;
    const { t } = useTranslation(lng, "lng", "");

    const breadMap = [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('statistic') },
    ];

    return (
        <>
            <div className="nso_statistic_section">
                <Path params={params} name={t('statistic')} breadMap={breadMap} />
                {children}
            </div>
        </>
    );
}
