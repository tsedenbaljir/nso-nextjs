"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client'
import NavbarDialog from '../Dialog/NavbarDialog';

export default function Footer({ lng }) {
    const { t } = useTranslation(lng, "lng", "");
    const router = useRouter();

    const [data, setData] = useState(null);
    const [navData, setNavData] = useState(null);
    const [socialLinks, setSocialLinks] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsResponse, navResponse] = await Promise.all([
                    fetch('/api/analytic'),
                    fetch('/api/menus/admin')
                ]);

                const analyticsData = await analyticsResponse.json();
                const navDataS = await navResponse.json();
                // const footerSocial = navData.find(nav => nav.parent_id === 'NEW_FOOTER_1');
                
                setData(analyticsData);
                setNavData(navDataS.data);
                // setSocialLinks(footerSocial);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [lng]);

    const getDialogShow = (dialogType) => {
        setSelectedType(dialogType);
        setDialogOpen(true);
    };

    const directLink = (link) => {
        window.open(link, '_blank');
    };

    return (
        <div className="nso_footer">
            <div className="nso_container">
                <div className="grid __group">
                    <div className="col-12 md:col-4 lg:col-4">
                        <span className="__title">{t('footer.links')}</span>
                        <div className="__content">
                            <div className="nso_add_item" onClick={() => getDialogShow(26)}>
                                <div className="__plus">
                                    <i className="pi pi-plus"></i>
                                </div>
                                <span className="__text">
                                    {t('footer.government')}
                                </span>
                            </div>
                            <div className="nso_add_item" onClick={() => getDialogShow(33)}>
                                <div className="__plus">
                                    <i className="pi pi-plus"></i>
                                </div>
                                <span className="__text">
                                    {t('footer.otherSites')}
                                </span>
                            </div>
                            <div className="nso_add_item" onClick={() => getDialogShow(41)}>
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
                            <div className="nso_add_item">
                                <div className="__plus">
                                    <i className="pi pi-check"></i>
                                </div>
                                <span className="__text">
                                    <a href={lng+'/terms_of_use'} target="_blank" rel="noopener noreferrer">
                                        {lng === "mn"?"Ашиглах нөхцөл":"terms of use"}
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
                                <span>{!loading && Number(data.rows[3].metricValues[0].value).toLocaleString('en-US')}</span>
                            </div>
                            <div className="__sub_labels">
                                <span>{t('footer.week')}</span>
                                <span>{!loading && Number(data.rows[2].metricValues[0].value).toLocaleString('en-US')}</span>
                            </div>
                            <div className="__sub_labels">
                                <span>{t('footer.thisMonth')}</span>
                                <span>{!loading && Number(data.rows[1].metricValues[0].value).toLocaleString('en-US')}</span>
                            </div>
                            <div className="__sub_labels">
                                <span>{t('footer.total')}</span>
                                <span>{!loading && Number(data.rows[0].metricValues[0].value).toLocaleString('en-US')}</span>
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
                                    <span className="__text">© {new Date().getFullYear()}. {t('footer.copyright')}</span>
                                </div>
                                <div>
                                    {/* {socialLinks && socialLinks.navitems && (
                                        <ul>
                                            {socialLinks.navitems.map((item, index) => (
                                                <li key={item.id}>
                                                    <span 
                                                        onClick={() => directLink(item.link)}
                                                        className={`social-icon nth-${index + 1}`}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    )} */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <NavbarDialog
                visible={dialogOpen}
                onClose={() => setDialogOpen(false)}
                type={selectedType}
                data={navData}
            />
        </div>
    );
}
