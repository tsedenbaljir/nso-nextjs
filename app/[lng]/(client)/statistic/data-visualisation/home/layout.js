"use client";
import { use } from "react";

import Path from '@/components/path/Index';
import { useTranslation } from '@/app/i18n/client';

export default function Statecate(props) {
    const { lng } = use(props.params);

    const {
        children
    } = props;
    const { t } = useTranslation(lng, "lng", "");

    const breadMap = [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('statistic'), url: [lng === 'mn' ? '/mn/statistic' : '/en/statistic'] },
        { label: t('dataVis.dataVisualisation') }
    ];

    return (
        <>
            <div className="nso_page_wrap">
                <Path name={t('statistic')} breadMap={breadMap} />
                {children}
            </div>
        </>
    );
}
