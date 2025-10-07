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
                            <div className="description w-full p-3 md:p-5">
                                <span dangerouslySetInnerHTML={{ __html: t('bnmau') }} />
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-5 w-full px-3 md:px-0">
                            <img
                                src="/images/bnmau/image1.png"
                                alt=""
                                className="descI w-full md:w-auto h-auto md:h-60 object-contain"
                            />
                            <img
                                src="/images/bnmau/image2.png"
                                alt=""
                                className="descI w-full md:w-auto h-auto md:h-60 object-contain"
                            />
                            <img
                                src="/images/bnmau/image3.png"
                                alt=""
                                className="descI w-full md:w-auto h-auto md:h-60 object-contain"
                            />
                        </div>
                        <br />
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center py-6 px-4">
                            <a
                                href={`/${lng}/statcate/table/Historical%20data/Enterprise`}
                                className="button-29 uppercase font-bold w-full sm:w-auto text-center"
                            >
                                {t('buttonBNMAU1')}
                            </a>
                            <a
                                href={`/${lng}/statcate/report/Historical%20data/Enterprise`}
                                className="button-29 uppercase font-bold w-full sm:w-auto text-center"
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
