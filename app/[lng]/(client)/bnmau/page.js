"use client"
import React, { useState, useEffect } from 'react';
import '@/components/styles/bnmau.scss';
import { useTranslation } from '@/app/i18n/client';

export default function Bnmau({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");
    return (
        <>
            <div className="nso_statistic_section">
                <div className="nso_container">
                    <div className="__post">
                        <br />
                        <div className="text-center">
                            <div className="__post_title items-center justify-center uppercase">
                                <p>{t('statCate.republicStatistic')}</p>
                            </div>
                        </div>
                        <div className="__fun_statistic_body">
                            <div className="description">
                                <span dangerouslySetInnerHTML={{ __html: t('bnmau') }} />
                            </div>
                        </div>
                        <div className="flex justify-between items-center gap-5" style={{ height: '240px' }}>
                            <img
                                src="/images/bnmau/image1.png"
                                alt=""
                                className="descI"
                                style={{ height: '240px' }}
                            />
                            <img
                                src="/images/bnmau/image2.png"
                                alt=""
                                className="descI"
                                style={{ height: '240px' }}
                            />
                            <img
                                src="/images/bnmau/image3.png"
                                alt=""
                                className="descI"
                                style={{ height: '240px' }}
                            />
                        </div>
                        <br />
                        <div style={{ height: '400px', overflow: 'hidden', textAlign: 'center' }}>
                            <a
                                href={`/${lng}/statcate/table/Historical%20data/Enterprise`}
                                className="button-29 uppercase font-bold"
                            >
                                {t('buttonBNMAU1')}
                            </a>
                            <a
                                href={`/${lng}/statcate/report/Historical%20data/Enterprise`}
                                className="button-29 uppercase font-bold"
                            >
                                {t('buttonBNMAU2')}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
