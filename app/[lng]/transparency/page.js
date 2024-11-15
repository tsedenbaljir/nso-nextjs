"use client"
import React from 'react';
import { useTranslation } from '@/app/i18n/client';
import BaseLayout from '@/components/baseLayout';

export default function Transparency({ params: { lng } }) {
    const { t } = useTranslation(lng);

    return (
        <BaseLayout lng={lng}>
            <div className="nso_transparency">
                <div className="nso_container">
                    <div className="transparency_header">
                        <h1>{t('transparency.title')}</h1>
                    </div>
                    <div className="transparency_content">
                        <div className="content_section">
                            <h2>{t('transparency.financial.title')}</h2>
                            <div className="section_content">
                                {/* Financial transparency content */}
                            </div>
                        </div>
                        
                        <div className="content_section">
                            <h2>{t('transparency.procurement.title')}</h2>
                            <div className="section_content">
                                {/* Procurement transparency content */}
                            </div>
                        </div>
                        
                        <div className="content_section">
                            <h2>{t('transparency.humanResource.title')}</h2>
                            <div className="section_content">
                                {/* Human resource transparency content */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
} 