"use client";

import Sidebar from '../../sidebar';
import Path from '@/components/path/Index';
import { useTranslation } from '@/app/i18n/client';

export default function Statecate({ children, params }) {
    const { lng } = params;
    const { t } = useTranslation(lng, "lng", "");

    const breadMap = [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('statistic'), url: [lng === 'mn' ? '/mn/statistic' : '/en/statistic'] },
        { label: t('dataVis.dataVisualisation') },
        // {
        //     label: this.data.name,
        //     url: [(this.isMn ? 'mn' : 'en') + '/statistic/data-visualisation/about-survey/' + this.data.id]
        // },
        { label: t('dataVis.aboutSurvey') },
    ];

    return (
        <div className="nso_page_wrap">
            <Path params={params} name={t('statistic')} breadMap={breadMap} />
            <div className='nso_container statisctic_body mt-5'>
                <Sidebar params={params} lng={lng} />
                {children}
            </div>
        </div>
    );
}
