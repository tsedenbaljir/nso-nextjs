"use client"
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/client'
import NavbarDialog from '../Dialog/NavbarDialog';
import FooterCarousel from './FooterCarousel';
import { notification } from 'antd';

const BRANCH_SITES_NAVITEMS = [
    {
        "id": 35364222,
        "name": "Arkhangai",
        "nameMn": "Архангай",
        "link": "https://arkhangai.nso.mn",
    },
    {
        "name": "Bayan-Ulgii",
        "nameMn": "Баян-Өлгий",
        "link": "https://bayan-ulgii.nso.mn",
    },
    {
        "name": "Bayankhongor",
        "nameMn": "Баянхонгор",
        "link": "https://bayankhongor.nso.mn",
    },
    {
        "name": "Bulgan",
        "nameMn": "Булган",
        "link": "https://bulgan.nso.mn",
    },
    {
        "name": "Govi-Altai",
        "nameMn": "Говь-Алтай",
        "link": "https://govi-altai.nso.mn",
    },
    {
        "name": "Govisumber",
        "nameMn": "Говьсүмбэр",
        "link": "https://govisumber.nso.mn",
    },
    {
        "name": "Darkhan-Uul",
        "nameMn": "Дархан-Уул",
        "link": "https://darkhan-uul.nso.mn",
    },
    {
        "name": "Dornogovi",
        "nameMn": "Дорноговь",
        "link": "https://dornogovi.nso.mn",
    },
    {
        "name": "Dornod",
        "nameMn": "Дорнод",
        "link": "https://dornod.nso.mn",
    },
    {
        "name": "Dundgovi",
        "nameMn": "Дундговь",
        "link": "https://dundgovi.nso.mn",
    },
    {
        "name": "Zavkhan",
        "nameMn": "Завхан",
        "link": "https://zavkhan.nso.mn",
    },
    {
        "name": "Orkhon",
        "nameMn": "Орхон",
        "link": "https://orkhon.nso.mn",
    },
    {
        "name": "Uvurkhangai",
        "nameMn": "Өвөрхангай",
        "link": "https://uvurkhangai.nso.mn",
    },
    {
        "name": "Umnugovi",
        "nameMn": "Өмнөговь",
        "link": "https://umnugovi.nso.mn",
    },
    {
        "name": "Sukhbaatar",
        "nameMn": "Сүхбаатар",
        "link": "https://sukhbaatar.nso.mn",
    },
    {
        "name": "Selenge",
        "nameMn": "Сэлэнгэ",
        "link": "https://selenge.nso.mn",
    },
    {
        "name": "Tuv",
        "nameMn": "Төв",
        "link": "https://tuv.nso.mn",
    },
    {
        "name": "Uvs",
        "nameMn": "Увс",
        "link": "https://uvs.nso.mn",
    },
    {
        "name": "Khovd",
        "nameMn": "Ховд",
        "link": "https://khovd.nso.mn",
    },
    {
        "name": "Khuvsgul",
        "nameMn": "Хөвсгөл",
        "link": "https://khuvsgul.nso.mn",
    },
    {
        "name": "Khentii",
        "nameMn": "Хэнтий",
        "link": "https://khentii.nso.mn",
    },
    {
        "name": "Ulaanbaatar",
        "nameMn": "Улаанбаатар",
        "link": "http://ubstat.mn",
    }
];

const GOVERNMENTAL_ORGANIZATIONS_NAVITEMS = [
    {
        "name": "Parliament of Mongolia",
        "nameMn": "Монгол Улсын Их Хурал",
        "link": "https://parliament.mn",
    },
    {
        "name": "Cabinet Secretariat of Government of Mongolia",
        "nameMn": "Монгол Улсын Засгийн газрын хэрэг эрхлэх газар",
        "link": "https://cabinet.gov.mn/",
    },
    {
        "name": "Anti Corruption Agency",
        "nameMn": "Авлигын эсрэг хамтдаа",
        "link": "https://iaac.mn",
    },
    {
        "name": "Declaration of Personal Interest",
        "nameMn": "Хувийн ашиг сонирхол, хөрөнгө орлогын мэдүүлэг",
        "link": "https://meduuleg.iaac.mn/AOS/Login",
    }
];

const FOREIGN_GOVERNMENT_ORGANIZATIONS_NAVITEMS = [
    // 🌏 Asia
    { id: 35364212, name: "Asia", nameMn: "Ази", link: null },
    { id: 35364213, name: "Azerbaijan", nameMn: "Азербайжан", link: "https://www.stat.gov.az/?lang=en" },
    { id: 35364214, name: "United Arab Emirates", nameMn: "Арабын нэгдсэн Эмират", link: "https://ghdx.healthdata.org/organizations/national-bureau-statistics-united-arab-emirates" },
    { id: 35364215, name: "Armenia", nameMn: "Армени", link: "https://armstat.am/en/?nid=301" },
    { id: 35364216, name: "Bhutan", nameMn: "Балба", link: "https://www.nsb.gov.bt/" },
    { id: 48160502, name: "Bangladesh", nameMn: "Бангладеш", link: "http://www.bbs.gov.bd/" },
    { id: 48160503, name: "Brunei", nameMn: "Бруней", link: "https://deps.mofe.gov.bn/Theme/Home.aspx" },
    { id: 47923101, name: "Vietnam", nameMn: "Вьетнам", link: "https://www.nso.gov.vn" },
    { id: 48807317, name: "Myanmar", nameMn: "Мьянмар", link: "https://www.mmsis.gov.mm/" },
    { id: 47923103, name: "Malaysia", nameMn: "Малайз", link: "https://www.dosm.gov.my" },
    { id: 47923104, name: "South Korea", nameMn: "Өмнөд Солонгос", link: "http://kostat.go.kr/portal/eng/index.action" },
    { id: 47923122, name: "Pakistan", nameMn: "Пакистан", link: "https://www.pbs.gov.pk/" },
    { id: 48807318, name: "Taiwan", nameMn: "Тайвань", link: "https://eng.stat.gov.tw/" },
    { id: 47923105, name: "Thailand", nameMn: "Тайланд", link: "https://www.nso.go.th" },
    { id: 47923106, name: "Philippines", nameMn: "Филиппин", link: "https://psa.gov.ph/" },
    { id: 48160501, name: "Hong Kong", nameMn: "Хонг Конг", link: "https://www.censtatd.gov.hk/en/" },
    { id: 48807902, name: "China", nameMn: "Хятад", link: "http://www.stats.gov.cn/english/" },
    { id: 47923137, name: "Sri Lanka", nameMn: "Шри Ланка", link: "http://www.statistics.gov.lk/" },
    { id: 47923112, name: "India", nameMn: "Энэтхэг", link: "https://www.mospi.gov.in" },
    { id: 47923110, name: "Japan", nameMn: "Япон", link: "https://www.stat.go.jp/english/" },

    // 🌏 Australia & Oceania
    { id: 47923109, name: "Australia & Oceania", nameMn: "Австрали ба Номхон далай", link: null },
    { id: 47923107, name: "Australia", nameMn: "Австрали", link: "https://www.abs.gov.au/" },
    { id: 47923102, name: "New Zealand", nameMn: "Шинэ Зеланд", link: "https://www.stats.govt.nz/" },

    // 🌎 America
    { id: 35364217, name: "America", nameMn: "Америк", link: null },
    { id: 35364218, name: "USA", nameMn: "АНУ", link: "https://www.usa.gov/statistics" },
    { id: 47923113, name: "Brazil", nameMn: "Бразил", link: "https://www.ibge.gov.br/en/home-eng.html" },
    { id: 48160504, name: "Venezuela", nameMn: "Венесуэл", link: "http://www.ine.gov.ve/" },
    { id: 35364219, name: "Canada", nameMn: "Канад", link: "https://www.statcan.gc.ca/en/start" },
    { id: 47923121, name: "Cuba", nameMn: "Куба", link: "https://globaledge.msu.edu/global-resources/resource/5890" },
    { id: 47923126, name: "Colombia", nameMn: "Колумб", link: "https://www.dane.gov.co/index.php/en/" },
    { id: 35364220, name: "Mexico", nameMn: "Мексик", link: "https://ghdx.healthdata.org/organizations/national-institute-statistics-and-geography-inegi-mexico" },
    { id: 48160505, name: "Jamaica", nameMn: "Ямайка", link: "https://statinja.gov.jm/" },

    // 🌍 Africa
    { id: 47923128, name: "Africa", nameMn: "Африк", link: null },
    { id: 47923124, name: "Algeria", nameMn: "Алжир", link: "https://ghdx.healthdata.org/organizations/national-office-statistics-algeria" },
    { id: 48807904, name: "Ghana", nameMn: "Гана", link: "https://www.statsghana.gov.gh/" },
    { id: 47923125, name: "Madagascar", nameMn: "Мадагаскар", link: "http://www.instat.mg/" },
    { id: 47923129, name: "Morocco", nameMn: "Марокко", link: "https://www.men.gov.ma/en/Pages/Statistics.aspx" },
    { id: 48807903, name: "Nigeria", nameMn: "Нигери", link: "https://www.nigerianstat.gov.ng/" },
    { id: 47923131, name: "Tunisia", nameMn: "Тунис", link: "http://www.ins.tn/en" },

    // 🌍 Europe
    { id: 47923111, name: "Europe", nameMn: "Европ", link: null },
    { id: 47923133, name: "Austria", nameMn: "Австри", link: "https://www.statistik.at/en" },
    { id: 47923134, name: "Belarus", nameMn: "Беларусь", link: "https://www.belstat.gov.by/en/" },
    { id: 47923138, name: "United Kingdom", nameMn: "Британи", link: "https://www.ons.gov.uk/" },
    { id: 47923108, name: "Germany", nameMn: "Герман", link: "https://www.destatis.de/EN/Home/_node.html" },
    { id: 47923135, name: "Georgia", nameMn: "Гүрж", link: "https://www.geostat.ge/en" },
    { id: 47923118, name: "Denmark", nameMn: "Дани", link: "https://www.dst.dk/en" },
    { id: 47923139, name: "Ireland", nameMn: "Ирланд", link: "https://www.cso.ie/en/index.html" },
    { id: 47923115, name: "Spain", nameMn: "Испани", link: "https://www.ine.es/en/" },
    { id: 47923114, name: "Italy", nameMn: "Итали", link: "https://www.istat.it/en/" },
    { id: 47923136, name: "Luxembourg", nameMn: "Люксембург", link: "https://statistiques.public.lu/en.html" },
    { id: 47923117, name: "Netherlands", nameMn: "Нидерланд", link: "https://www.cbs.nl/en-gb" },
    { id: 47923123, name: "Norway", nameMn: "Норвег", link: "https://www.ssb.no/en" },
    { id: 47923120, name: "Poland", nameMn: "Польш", link: "https://stat.gov.pl/en/" },
    { id: 48807908, name: "Portugal", nameMn: "Португал", link: "https://www.ine.pt/xportal/xmain?xpgid=ine_main&xpid=INE" },
    { id: 47923116, name: "Turkey", nameMn: "Турк", link: "https://www.tuik.gov.tr/Home/Index" },
    { id: 47923127, name: "Finland", nameMn: "Финланд", link: "https://www.stat.fi/index_en.html" },
    { id: 47923130, name: "Sweden", nameMn: "Швед", link: "https://www.scb.se/en/" },
    { id: 47923132, name: "Ukraine", nameMn: "Украин", link: "https://www.lv.ukrstat.gov.ua/eng/select.php?m=site" },
    { id: 47923119, name: "Hungary", nameMn: "Унгар", link: "https://www.ksh.hu/?lang=en" }
];


export default function Footer({ lng }) {
    const { t } = useTranslation(lng, "lng", "");

    const [data, setData] = useState(null);
    const [navData, setNavData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [email, setEmail] = useState('');

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
                const analyticsResponse = await fetch('/api/analytic', { cache: "no-store" }); // No cache

                if (analyticsResponse.status === 200) {
                    const analyticsData = await analyticsResponse.json();

                    setData(analyticsData);
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
        if (dialogType === 101) {
            const localizedData = GOVERNMENTAL_ORGANIZATIONS_NAVITEMS.map(item => ({
                ...item,
                displayName: lng === "mn" ? item.nameMn : item.name
            }));
            setNavData(localizedData);
        }
        if (dialogType === 100) {
            const localizedData = BRANCH_SITES_NAVITEMS.map(item => ({
                ...item,
                displayName: lng === "mn" ? item.nameMn : item.name
            }));
            setNavData(localizedData);
        }
        if (dialogType === 99) {
            const localizedData = FOREIGN_GOVERNMENT_ORGANIZATIONS_NAVITEMS.sort((a, b) => a.nameMn - b.nameMn).map(item => ({
                ...item,
                displayName: lng === "mn" ? item.nameMn : item.name
            }));
            setNavData(localizedData);
        }
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
                            {/* <div className="nso_add_item">
                                <div className="__plus">
                                    <i className="pi pi-link"></i>
                                </div>
                                <span className="__text">
                                    <a href="http://www2.1212.mn/" target="_blank" rel="noopener noreferrer">
                                        {t('footer.oldVersion2')}
                                    </a>
                                </span>
                            </div> */}
                            <div className="nso_add_item">
                                <div className="__plus">
                                    <i className="pi pi-link"></i>
                                </div>
                                <span className="__text">
                                    <a href="http://www2.1212.mn" target="_blank" rel="noopener noreferrer">
                                        {t('footer.oldVersion1')}
                                    </a>
                                </span>
                            </div>
                            <div className="nso_add_item">
                                <div className="__plus">
                                    <i className="pi pi-check"></i>
                                </div>
                                <span className="__text">
                                    <a href={`${lng === "mn" ? "https://www.nso.mn/mn/terms_of_use" : 'https://www.nso.mn/en/terms_of_use'}`} target="_blank" rel="noopener noreferrer">
                                        {lng === "mn" ? "Ашиглах нөхцөл" : "Terms of use"}
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
                            <div style={{ marginTop: '90px' }}>
                                <FooterCarousel />
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
                                        placeholder={t('footer.email')}
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
                    <div className="__sub_footer">
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
                                                <i className="pi pi-whatsapp text-white rounded-full text-2xl"></i>
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
                data={navData}
                lng={lng}
            />
        </div>
    );
}
