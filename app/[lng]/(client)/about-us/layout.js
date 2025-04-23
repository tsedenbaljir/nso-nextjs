"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';
import { BreadCrumb } from 'primereact/breadcrumb';

export default function Statecate({ children, params: { lng } }) {
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useTranslation(lng, "lng", "");

    const breadMap = [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('aboutUs') },
    ];

    return (
        <>
            <div className='nso_about_us'>
                <div className="about_us_header">
                    <div className="nso_container">
                        <div className="about_us_header_text">
                            <div className="nso_page_header" style={{ background: 'none' }}>
                                <div className="nso_container">
                                    <div className="__header">
                                        <span>
                                            {t("nso")}
                                        </span>
                                        <BreadCrumb model={breadMap} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="nso_about_us_menu">
                    <div className="nso_container">
                        <div className="sub_menu">
                            <ul>
                                <li
                                    onClick={() => router.push('/' + lng + '/about-us/home')}
                                    className={`${pathname.includes('/about-us/home') ? 'active_about' : ''}`}
                                >
                                    {t('home')}
                                </li>
                                <li
                                    onClick={() => router.push('/' + lng + '/about-us/cooperation')}
                                    className={`${pathname.includes('/about-us/cooperation') ? 'active_about' : ''}`}
                                >
                                    {t('menuAboutUs.cooperation')}
                                </li>
                                <li
                                    onClick={() => router.push('/' + lng + '/about-us/workspace')}
                                    className={`${pathname.includes('/about-us/workspace') ? 'active_about' : ''}`}
                                >
                                    {t('menuAboutUs.workspace')}
                                </li>
                                <li
                                    onClick={() => router.push('/' + lng + '/about-us/news/home')}
                                    className={`${pathname.includes('/about-us/news/') ? 'active_about' : ''}`}
                                >
                                    {t('menuAboutUs.news')}
                                </li>
                                <li
                                    onClick={() => router.push('/' + lng + '/about-us/laws/main')}
                                    className={`${pathname.includes('/about-us/laws') ? 'active_about' : ''}`}
                                >
                                    {t('menuAboutUs.legal')}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                {children}
            </div>
        </>
    );
}
