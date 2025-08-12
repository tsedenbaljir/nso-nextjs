"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client'
import NavbarDialog from '../Dialog/NavbarDialog';
import { message, notification } from 'antd';

export default function Footer({ lng }) {
    const { t } = useTranslation(lng, "lng", "");
    const router = useRouter();

    const [data, setData] = useState(null);
    const [navData, setNavData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };
    notification.config({
        placement: 'topRight',
        top: 100,
    });
    const handleSubscribe = async () => {
        if (!email) {
            notification.warning({
                message: 'Анхааруулга',
                description: 'Цахим шуудангийн хаяг оруулна уу.',
                duration: 2,
            });
            return;
        }

        try {
            const response = await fetch('/api/insert/subscribeEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok) {
                notification.success({
                    message: 'Амжилттай',
                    description: 'Таны хүсэлтийг хүлээн авлаа.',
                    duration: 2,
                });

                setTimeout(() => {
                    setEmail('');
                }, 1000);
            } else {
                notification.error({
                    message: 'Алдаа',
                    description: result.error || 'Алдаа гарлаа',
                    duration: 3,
                });
            }
        } catch (error) {
            notification.error({
                message: 'Алдаа',
                description: 'Сүлжээний алдаа гарлаа',
                duration: 3,
            });
        }
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsResponse, navResponse] = await Promise.all([
                    fetch('/api/analytic', { cache: "no-store" }), // No cache
                    fetch('/api/menus/admin', { cache: "no-store" }) // No cache
                ]);

                if (analyticsResponse.status === 200 && navResponse.status === 200) {
                    const analyticsData = await analyticsResponse.json();
                    const navDataS = await navResponse.json();

                    setData(analyticsData);
                    setNavData(navDataS.data);
                }
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
                            <div className="nso_add_item" onClick={() => getDialogShow(101)}>
                                <div className="__plus">
                                    <i className="pi pi-plus"></i>
                                </div>
                                <span className="__text">
                                    {t('footer.government')}
                                </span>
                            </div>
                            <div className="nso_add_item" onClick={() => getDialogShow(100)}>
                                <div className="__plus">
                                    <i className="pi pi-plus"></i>
                                </div>
                                <span className="__text">
                                    {t('footer.otherSites')}
                                </span>
                            </div>
                            <div className="nso_add_item" onClick={() => getDialogShow(99)}>
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
                                    <a href={lng + '/terms_of_use'} target="_blank" rel="noopener noreferrer">
                                        {lng === "mn" ? "Ашиглах нөхцөл" : "terms of use"}
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
                                <span>{!loading && Number(data?.rows[3]?.metricValues[0]?.value).toLocaleString('en-US')}</span>
                            </div>
                            <div className="__sub_labels">
                                <span>{t('footer.week')}</span>
                                <span>{!loading && Number(data?.rows[2]?.metricValues[0]?.value).toLocaleString('en-US')}</span>
                            </div>
                            <div className="__sub_labels">
                                <span>{t('footer.thisMonth')}</span>
                                <span>{!loading && Number(data?.rows[1]?.metricValues[0]?.value).toLocaleString('en-US')}</span>
                            </div>
                            <div className="__sub_labels">
                                <span>{t('footer.total')}</span>
                                <span>{!loading && Number(data?.rows[0]?.metricValues[0]?.value).toLocaleString('en-US')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 md:col-4 lg:col-4">
                        <span className="__title">{t('footer.getLatestNews')}</span>
                        <div className="__content">
                            <span className="__desc">{t('footer.suggestionForNewReport')}</span>
                            <div _ngcontent-lvi-c61="" className="__input">
                                {/* <span className="p-input-icon-right">
                                    <input
                                        type="email"
                                        name="email"
                                        autoComplete="off"
                                        placeholder="Имэйл хаяг"
                                        className="p-inputtext p-component"
                                    />
                                    <button className="arrow-button">
                                        <i className="pi pi-arrow-right"></i>
                                    </button>
                                </span> */}
                                <span className="p-input-icon-right">
                                    <input
                                        type="email"
                                        name="email"
                                        autoComplete="off"
                                        placeholder={t('Имэйл хаяг')}
                                        className="p-inputtext p-component"
                                        value={email}
                                        onChange={handleEmailChange}
                                    />
                                    <button className="arrow-button" onClick={handleSubscribe}>
                                        <i className="pi pi-arrow-right"></i>
                                    </button>
                                </span>
                            </div>
                            <div className="__input" style={{ display: 'flex' }}>
                                <div className="__input">
                                    <a href="https://iaac.mn/" target="_blank" rel="noopener noreferrer">
                                        <img src="/images/110-call-atg-logo.gif" width="140px" alt="Logo" />
                                    </a>
                                </div>
                                <div className="__input">
                                    <img src="/images/qr-code 1.png" style={{ marginLeft: '10px' }} width={84} alt="QR Code" />
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
                                    {/* {socialLinks && socialLinks.navitems && ( */}
                                    <ul>
                                        {/* {socialLinks.navitems.map((item, index) => ( */}
                                        <li className='flex items-center gap-2'>
                                            <a className='social-icon nth-1' href="https://www.facebook.com/StatisticMGL" target="_blank" rel="noopener noreferrer">
                                                <i className="pi pi-facebook text-white rounded-full text-2xl"></i>
                                            </a>
                                            <a className='social-icon nth-1' href="https://www.instagram.com/statisticsmgl/" target="_blank" rel="noopener noreferrer">
                                                <i className="pi pi-instagram text-white rounded-full text-2xl"></i>
                                            </a>
                                            <a className='social-icon nth-1' href="https://x.com/StatisticMGL" target="_blank" rel="noopener noreferrer">
                                                <i className="pi pi-twitter text-white rounded-full text-2xl"></i>
                                            </a>
                                            <a className='social-icon nth-1' href="https://invite.viber.com/?g2=AQAzp9NJAUNbnU%2FNkn9IZOVy0QI1dPj2t2XCc3HiJNJ0oZkkTPTNKgHbahaa2FLz" target="_blank" rel="noopener noreferrer">
                                                <i className="pi pi-viber text-white rounded-full text-2xl"></i>
                                            </a>
                                            <a className='social-icon nth-1' href="https://t.me/StatisticMGL" target="_blank" rel="noopener noreferrer">
                                                <i className="pi pi-telegram text-white rounded-full text-2xl"></i>
                                            </a>
                                            <a className='social-icon nth-1' href="https://www.youtube.com/@statisticmgl6111" target="_blank" rel="noopener noreferrer">
                                                <i className="pi pi-youtube text-white rounded-full text-3xl"></i>
                                            </a>
                                            <a className='social-icon nth-1' href="https://www.linkedin.com/in/national-statistics-office-of-mongolia-b38565377/" target="_blank" rel="noopener noreferrer">
                                                <i className="pi pi-linkedin text-white rounded-full text-2xl"></i>
                                            </a>
                                        </li>
                                        {/* // ))} */}
                                    </ul>
                                    {/* )} */}
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
