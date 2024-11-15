"use client"
import React from 'react';
import { useTranslation } from '@/app/i18n/client';
import BaseLayout from '@/components/baseLayout';
import Link from 'next/link';

export default function Corruption({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");

    return (
        <BaseLayout lng={lng}>
            <div className="nso_transparency mt-35">
                <div className="nso_container">
                    <div className="transparency_header">
                        <h1>{t('transparency.title')}</h1>
                    </div>
                    <div className="transparency_content">
                        <div className="content_section">
                            <div className="section_content">
                                <div className="transparency_links">
                                    <Link href="#" className="transparency_link">
                                        {t('tran1')}
                                    </Link>
                                    <Link href="#" className="transparency_link">
                                        {t('tran2')}
                                    </Link>
                                    <Link href="#" className="transparency_link">
                                        {t('tran3')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
} 