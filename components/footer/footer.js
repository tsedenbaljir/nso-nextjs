"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client'

export default function Footer({ lng }) {
    const { t } = useTranslation(lng, "lng", "");
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [tabMenusList, setTabMenusList] = useState([]); // Initialize with your tabs data
    const [tabItems, setTabItems] = useState([]); // Initialize with your tab items data
    const currentYear = new Date().getFullYear();

    const getDialogShow = (dialogId) => {
        // Logic to show dialog based on dialogId
        setDialogOpen(true);
    };

    const directLink = (link) => {
        window.location.href = link;
    };

    const sendEmail = () => {
        // Logic to handle email submission
    };

    return (
        <div className="nso_footer">
            <div className="nso_container">
                <div className="grid __group">
                    <div className="col-12 md:col-4 lg:col-4">
                        <span className="__title">{t('footer.links')}</span>
                        <div className="__content">
                            <div className="nso_add_item" onClick={() => getDialogShow('NEW_FLINK2')}>
                                <div className="__plus">
                                    <i className="pi pi-plus"></i>
                                </div>
                                <span className="__text">
                                    {t('footer.government')}
                                </span>
                            </div>
                            <div className="nso_add_item" onClick={() => getDialogShow('NEW_FLINK3')}>
                                <div className="__plus">
                                    <i className="pi pi-plus"></i>
                                </div>
                                <span className="__text">
                                    {t('footer.otherSites')}
                                </span>
                            </div>
                            <div className="nso_add_item" onClick={() => getDialogShow('NEW_FLINK1')}>
                                <div className="__plus">
                                    <i className="pi pi-plus"></i>
                                </div>
                                <span className="__text">
                                    {t('footer.foreignGovernment')}
                                </span>
                            </div>
                            <div className="nso_add_item">
                                <div className="__plus">
                                    <i className="pi pi-link"></i>
                                </div>
                                <span className="__text">
                                    <a href="http://www2.1212.mn/" target="_blank" rel="noopener noreferrer">
                                        {t('footer.oldVersion2')}
                                    </a>
                                </span>
                            </div>
                            <div className="nso_add_item">
                                <div className="__plus">
                                    <i className="pi pi-link"></i>
                                </div>
                                <span className="__text">
                                    <a href="http://www1.1212.mn/" target="_blank" rel="noopener noreferrer">
                                        {t('footer.oldVersion1')}
                                    </a>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <span className="__title">{t('footer.traffic')}</span>
                        <div className="__content">
                            <div className="__sub_labels">
                                <span>{t('footer.today')}</span>
                                <span>{/* Insert traffic data for today */}</span>
                            </div>
                            <div className="__sub_labels">
                                <span>{t('footer.week')}</span>
                                <span>{/* Insert traffic data for the week */}</span>
                            </div>
                            <div className="__sub_labels">
                                <span>{t('footer.thisMonth')}</span>
                                <span>{/* Insert traffic data for this month */}</span>
                            </div>
                            <div className="__sub_labels">
                                <span>{t('footer.total')}</span>
                                <span>{/* Insert traffic data for total */}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <span className="__title">{t('footer.getLatestNews')}</span>
                        <div className="__content">
                            <span className="__desc">{t('footer.suggestionForNewReport')}</span>
                            <div className="__input">
                                <span className="p-input-icon-right">
                                    <i className="pi pi-arrow-right" ></i>
                                    <input
                                        type="email"
                                        name="email"
                                        autoComplete="off"
                                        // {...register('email', { required: true })}
                                        placeholder={t('footer.email')}
                                    />
                                </span>
                            </div>
                            <div className="__input" style={{ display: 'flex' }}>
                                <div className="__input">
                                    <a href="https://iaac.mn/" target="_blank" rel="noopener noreferrer">
                                        <img src="/assets/images/110-call-atg-logo.gif" width="140px" alt="Logo" />
                                    </a>
                                </div>
                                <div className="__input">
                                    <img src="/assets/images/refreshQR.png" style={{ marginLeft: '10px' }} height="83px" alt="QR Code" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="__sub_footer col-12 md:col-12 lg:col-12">
                        <div>
                            <div className="__wrap_between">
                                <div>
                                    <span className="__text">© {currentYear}. {t('footer.copyright')}</span>
                                </div>
                                <div>
                                    {/* Replace with your social links */}
                                    <ul>
                                        {/* Add social links here */}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
