"use client"
import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/app/i18n/client';

export default function Transparency({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");

    const categories = [
        {
            title: t('tran1'),
            icon: 'pi pi-file'
        },
        {
            title: t('tran2'),
            icon: 'pi pi-shield'
        },
        {
            title: t('tran3'),
            icon: 'pi pi-users'
        },
        {
            title: t('tran4'),
            icon: 'pi pi-building'
        },
        {
            title: 'Мэдээллийн аюулгүй байдлын бодлого',
            icon: 'pi pi-shield'
        },
    ];

    return (
        <>
            <div className="nso_statistic_section">
                <div className="nso_container">
                    <div className="w-full">
                        <div className="transparency_header text-left">
                            <h1>{t('transparency.title')}</h1>
                        </div>
                        <div className="transparency_grid">
                            {categories.map((category, index) => (
                                <Link href={`/${lng}/transparency/` + category.title} key={index} className="transparency_card">
                                    <div className="card_content">
                                        <span className="card_title">{category.title}</span>
                                    </div>
                                    <div className="card_arrow">
                                        <i className="pi pi-arrow-right"></i>
                                    </div>
                                </Link>
                            ))}
                            <Link href={`/${lng}/laws/rules`} className="transparency_card">
                                <div className="card_content">
                                    <span className="card_title">{t('law')}</span>
                                </div>
                                <div className="card_arrow">
                                    <i className="pi pi-arrow-right"></i>
                                </div>
                            </Link>
                            <Link href={`/mn/transparency/tender`} className="transparency_card">
                                <div className="card_content">
                                    <span className="card_title">{t('TENDER')}</span>
                                </div>
                                <div className="card_arrow">
                                    <i className="pi pi-arrow-right"></i>
                                </div>
                            </Link>
                            <Link href={`/mn/violation`} className="transparency_card">
                                <div className="card_content">
                                    <span className="card_title">Мэдээллийн аюулгүй байдлын зөрчил мэдээлэх</span>
                                </div>
                                <div className="card_arrow">
                                    <i className="pi pi-arrow-right"></i>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
