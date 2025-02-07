import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/app/i18n/client';

export default function Index({ lng }) {
    const { t } = useTranslation(lng, "lng", "");
    return (
        <>
            <div className="nso_home_statistic">
                <div className="nso_container">
                    <span className="__group_title">Статистик</span>
                </div>
                <div className="nso_container">
                    <div className="__statistic_groups">
                        <div className="__group">
                            <div className="__statistics">
                                <Link className="__card" href={`/${lng}/statecate/table/Pop/pop6`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.populationHousehold')}</span>
                                </Link>
                                <Link className="__card" href={`/${lng}/statecate/table/Industry_service/Service_industrial`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.business')}</span>
                                </Link>
                                <Link className="__card" href={`/${lng}/statecate/table/Society%20and%20development/Gender`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.society')}</span>
                                </Link>
                                <Link className="__card" href={`/${lng}/statecate/table/Economy,%20environment/economy_env`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.economy')}</span>
                                </Link>
                                <Link className="__card" href={`/${lng}/statecate/table/Education,%20health/Edu_main`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.environment')}</span>
                                </Link>
                                <Link className="__card" href={`/${lng}/statecate/table/Labor/Labor3`}>
                                    <span className="__icon"></span>
                                    <span className="__name">{t('statCate.labourForce')}</span>
                                </Link>
                            </div>
                        </div>
                        <div className="__group">
                            <div className="__highlight">
                                <div className="__card">
                                    <span className="__desc">2023-12-31</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: 'url("https://downloads.1212.mn/tIvK--fOd--8ycP-bO-TwA_mR6_O7-w67Rma2T-r.png")' }}></span>
                                        Малын тоо*
                                    </span>
                                    <span className="__count">64.7 сая</span>
                                </div>
                                <div className="__card">
                                    <span className="__desc">2024-01-01</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: 'url("https://downloads.1212.mn/508Md-xy_eD-WNdyAJ_5jxjuJ5XOw-G37RFVast_.png")' }}></span>
                                        Голч цалин
                                    </span>
                                    <span className="__count">2.5 сая</span>
                                </div>
                                <div className="__card">
                                    <span className="__desc">2024-12-01</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: 'url("https://downloads.1212.mn/508Md-xy_eD-WNdyAJ_5jxjuJ5XOw-G37RFVast_.png")' }}></span>
                                        Өрхийн сарын дундаж орлого
                                    </span>
                                    <span className="__count">2 сая</span>
                                </div>
                                <div className="__card">
                                    <span className="__desc">2023-12-20</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: 'url("https://downloads.1212.mn/6ULXrEi2_5d0-UAql-_DYpEx-Dn3TMi4rw6-pG-6.png")' }}></span>
                                        Ажиллах хүчний оролцоо
                                    </span>
                                    <span className="__count">62.2 %</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
