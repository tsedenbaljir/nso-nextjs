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
                                <span>235{/* Insert traffic data for today */}</span>
                            </div>
                            <div className="__sub_labels">
                                <span>{t('footer.week')}</span>
                                <span>1564{/* Insert traffic data for the week */}</span>
                            </div>
                            <div className="__sub_labels">
                                <span>{t('footer.thisMonth')}</span>
                                <span>24234{/* Insert traffic data for this month */}</span>
                            </div>
                            <div className="__sub_labels">
                                <span>{t('footer.total')}</span>
                                <span>124234{/* Insert traffic data for total */}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <span className="__title">{t('footer.getLatestNews')}</span>
                        <div className="__content">
                            <span className="__desc">{t('footer.suggestionForNewReport')}</span>

                            <div _ngcontent-lvi-c61="" className="__input">
                                <span _ngcontent-lvi-c61="" className="p-input-icon-right">
                                    {/* <i _ngcontent-lvi-c61="" className="pi pi-arrow-right"></i> */}
                                    <input _ngcontent-lvi-c61="" type="email" name="email" autoComplete="off" formcontrolname="email" pinputtext="" placeholder="Имэйл хаяг" className="ng-untouched ng-pristine ng-invalid p-inputtext p-component" />
                                </span>
                            </div>
                            <div className="__input" style={{ display: 'flex' }}>
                                <div className="__input">
                                    <a href="https://iaac.mn/" target="_blank" rel="noopener noreferrer">
                                        <img src="/images/110-call-atg-logo.gif" width="140px" alt="Logo" />
                                    </a>
                                </div>
                                <div className="__input">
                                    <img src="/images/refreshQR.png" style={{ marginLeft: '10px' }} width={84} alt="QR Code" />
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
                                    <ul _ngcontent-lvi-c61="" className="ng-star-inserted">
                                        <li _ngcontent-lvi-c61="" className="ng-star-inserted">
                                            <span _ngcontent-lvi-c61=""></span>
                                        </li>
                                        <li _ngcontent-lvi-c61="" className="ng-star-inserted">
                                            <span _ngcontent-lvi-c61=""></span>
                                        </li>
                                        <li _ngcontent-lvi-c61="" className="ng-star-inserted">
                                            <span _ngcontent-lvi-c61=""></span>
                                        </li>
                                        <li _ngcontent-lvi-c61="" className="ng-star-inserted">
                                            <span _ngcontent-lvi-c61=""></span>
                                        </li>
                                        <li _ngcontent-lvi-c61="" className="ng-star-inserted">
                                            <span _ngcontent-lvi-c61=""></span>
                                        </li></ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
