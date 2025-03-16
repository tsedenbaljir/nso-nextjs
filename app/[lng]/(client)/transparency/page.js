"use client"
import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/app/i18n/client';

export default function Transparency({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");
    const isMn = lng === 'mn';

    return (
        <div className="nso_statistic_category" style={{ background: 'white' }}>
            <div className="nso_container">
                <div className="__card_groups">
                    <Link href={`/${lng}/transparency/${t('tran1')}`} className="__card" style={{ background: 'var(--surface-bk2)' }}>
                        <div className="__category_group">
                            <span>{t('tran1')}</span>
                        </div>
                        <div className="circle">
                            <i className="pi pi-arrow-right"></i>
                        </div>
                    </Link>

                    <Link href={`/${lng}/transparency/${t('tran2')}`} className="__card" style={{ background: 'var(--surface-bk2)' }}>
                        <div className="__category_group">
                            <span>{t('tran2')}</span>
                        </div>
                        <div className="circle">
                            <i className="pi pi-arrow-right"></i>
                        </div>
                    </Link>

                    <Link href={`/${lng}/transparency/${t('tran3')}`} className="__card" style={{ background: 'var(--surface-bk2)' }}>
                        <div className="__category_group">
                            <span>{t('tran3')}</span>
                        </div>
                        <div className="circle">
                            <i className="pi pi-arrow-right"></i>
                        </div>
                    </Link>

                    <Link href={`/${lng}/transparency/${t('tran4')}`} className="__card" style={{ background: 'var(--surface-bk2)' }}>
                        <div className="__category_group">
                            <span>{t('tran4')}</span>
                        </div>
                        <div className="circle">
                            <i className="pi pi-arrow-right"></i>
                        </div>
                    </Link>

                    {isMn && (
                        <Link href={`/${lng}/about-us/news/tender`} className="__card" style={{ background: 'var(--surface-bk2)' }}>
                            <div className="__category_group">
                                <span>{t('TENDER')}</span>
                            </div>
                            <div className="circle">
                                <i className="pi pi-arrow-right"></i>
                            </div>
                        </Link>
                    )}

                    <Link href={`/${lng}/about-us/laws/main`} className="__card" style={{ background: 'var(--surface-bk2)' }}>
                        <div className="__category_group">
                            <span>{t('law')}</span>
                        </div>
                        <div className="circle">
                            <i className="pi pi-arrow-right"></i>
                        </div>
                    </Link>

                    {isMn && (
                        <Link href={`/${lng}/transparency/mabb`} className="__card" style={{ background: 'var(--surface-bk2)' }}>
                            <div className="__category_group">
                                <span>Мэдээллийн аюулгүй байдлын бодлого</span>
                            </div>
                            <div className="circle">
                                <i className="pi pi-arrow-right"></i>
                            </div>
                        </Link>
                    )}

                    {isMn && (
                        <Link href={`/${lng}/violation`} className="__card" style={{ background: 'var(--surface-bk2)' }}>
                            <div className="__category_group">
                                <span>Мэдээллийн аюулгүй байдлын зөрчил мэдээлэх</span>
                            </div>
                            <div className="circle">
                                <i className="pi pi-arrow-right"></i>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}