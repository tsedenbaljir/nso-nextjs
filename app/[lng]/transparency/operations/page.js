"use client"
import React from 'react';
import { useTranslation } from '@/app/i18n/client';
import BaseLayout from '@/components/baseLayout';
import Link from 'next/link';

export default function Operations({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");

    return (
        <BaseLayout lng={lng}>
            <div className="nso_transparency mt-35">
                <div className="nso_container">
                    <div className="transparency_header">
                        <h1>{t('tran1')}</h1>
                    </div>
                    <div className="transparency_content">
                        <div className="content_section">
                            <div className="section_content">
                                <div className="transparency_links">
                                    <Link href="#" className="transparency_link">
                                        {t('transparency.financial.budget')}
                                    </Link>
                                    <Link href="#" className="transparency_link">
                                        {t('transparency.financial.execution')}
                                    </Link>
                                    <Link href="#" className="transparency_link">
                                        {t('transparency.financial.audit')}
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