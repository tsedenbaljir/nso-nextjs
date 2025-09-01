"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client'
import NavbarDialog from '../Dialog/NavbarDialog';
import { message, notification } from 'antd';

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
        "nameMn": "Монгол Улсын Их Хурлын",
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
    {
        "id": 35364212,
        "name": "Asia",
        "nameMn": "Ази",
        "parent": 0,
        "link": null,
        "published": true,
        "listOrder": 0,
        "content": null
    },
    {
        "id": 35364213,
        "name": "Azerbaijan",
        "nameMn": "Азербайжан",
        "parent": 35364212,
        "link": "https://www.stat.gov.az/?lang=en",
        "published": true,
        "listOrder": 1,
        "content": null
    },
    {
        "id": 35364214,
        "name": "United Arab Emirates",
        "nameMn": "Арабын нэгдсэн Эмират",
        "parent": 35364212,
        "link": "https://ghdx.healthdata.org/organizations/national-bureau-statistics-united-arab-emirates",
        "published": true,
        "listOrder": 2,
        "content": null
    },
    {
        "id": 35364215,
        "name": "Armenia",
        "nameMn": "Армени",
        "parent": 35364212,
        "link": "https://armstat.am/en/?nid=301",
        "published": true,
        "listOrder": 3,
        "content": null
    },
    {
        "id": 35364216,
        "name": "Bhutan",
        "nameMn": "Балба",
        "parent": 35364212,
        "link": "https://www.nsb.gov.bt/",
        "published": true,
        "listOrder": 4,
        "content": null
    },
    {
        "id": 48160502,
        "name": "Bangladesh",
        "nameMn": "Бангладеш",
        "parent": 35364212,
        "link": "http://www.bbs.gov.bd/",
        "published": true,
        "listOrder": 5,
        "content": null
    },
    {
        "id": 48160503,
        "name": "Brunei",
        "nameMn": "Бруней",
        "parent": 35364212,
        "link": "https://deps.mofe.gov.bn/Theme/Home.aspx",
        "published": true,
        "listOrder": 6,
        "content": null
    },
    {
        "id": 47923101,
        "name": "Vietnam",
        "nameMn": "Вьетнам",
        "parent": 35364212,
        "link": "https://www.nso.gov.vn",
        "published": true,
        "listOrder": 7,
        "content": null
    },
    {
        "id": 48807317,
        "name": "Myanmar",
        "nameMn": "Мьянмар",
        "parent": 35364212,
        "link": "https://www.mmsis.gov.mm/",
        "published": true,
        "listOrder": 8,
        "content": null
    },
    {
        "id": 47923103,
        "name": "Malaysia",
        "nameMn": "Малайз",
        "parent": 35364212,
        "link": "https://www.dosm.gov.my",
        "published": true,
        "listOrder": 9,
        "content": null
    },
    {
        "id": 47923104,
        "name": "South Korea",
        "nameMn": "Өмнөд Солонгос",
        "parent": 35364212,
        "link": "http://kostat.go.kr/portal/eng/index.action",
        "published": true,
        "listOrder": 10,
        "content": null
    },
    {
        "id": 47923122,
        "name": "Pakistan",
        "nameMn": "Пакистан",
        "parent": 35364212,
        "link": "https://www.pbs.gov.pk/",
        "published": true,
        "listOrder": 11,
        "content": null
    },
    {
        "id": 48807318,
        "name": "Taiwan",
        "nameMn": "Тайвань",
        "parent": 35364212,
        "link": "https://eng.stat.gov.tw/",
        "published": true,
        "listOrder": 12,
        "content": null
    },
    {
        "id": 47923105,
        "name": "Thailand",
        "nameMn": "Тайланд",
        "parent": 35364212,
        "link": "https://www.nso.go.th",
        "published": true,
        "listOrder": 13,
        "content": null
    },
    {
        "id": 47923106,
        "name": "Philippines",
        "nameMn": "Филиппин",
        "parent": 35364212,
        "link": "https://psa.gov.ph/",
        "published": true,
        "listOrder": 14,
        "content": null
    },
    {
        "id": 48160501,
        "name": "Hong Kong",
        "nameMn": "Хонг Конг",
        "parent": 35364212,
        "link": "https://www.censtatd.gov.hk/en/",
        "published": true,
        "listOrder": 15,
        "content": null
    },
    {
        "id": 48807902,
        "name": "China",
        "nameMn": "Хятад",
        "parent": 35364212,
        "link": "http://www.stats.gov.cn/english/",
        "published": true,
        "listOrder": 16,
        "content": null
    },
    {
        "id": 47923137,
        "name": "Sri Lanka",
        "nameMn": "Шри Ланка",
        "parent": 35364212,
        "link": "http://www.statistics.gov.lk/",
        "published": true,
        "listOrder": 17,
        "content": null
    },
    {
        "id": 47923112,
        "name": "India",
        "nameMn": "Энэтхэг",
        "parent": 35364212,
        "link": "https://www.mospi.gov.in",
        "published": true,
        "listOrder": 18,
        "content": null
    },
    {
        "id": 48807901,
        "name": "Taiwan",
        "nameMn": "Тайвань",
        "parent": 35364212,
        "link": null,
        "published": true,
        "listOrder": 19,
        "content": null
    },
    {
        "id": 47923110,
        "name": "Japan",
        "nameMn": "Япон",
        "parent": 35364212,
        "link": "https://www.stat.go.jp/english/",
        "published": true,
        "listOrder": 20,
        "content": null
    },
    {
        "id": 47923109,
        "name": "Australia",
        "nameMn": "Австрали",
        "parent": 0,
        "link": null,
        "published": true,
        "listOrder": 21,
        "content": null
    },
    {
        "id": 47923107,
        "name": "Australia",
        "nameMn": "Австрали",
        "parent": 47923109,
        "link": "https://www.abs.gov.au/",
        "published": true,
        "listOrder": 22,
        "content": null
    },
    {
        "id": 47923102,
        "name": "New Zealand",
        "nameMn": "Шинэ Зеланд",
        "parent": 47923109,
        "link": "https://www.stats.govt.nz/",
        "published": true,
        "listOrder": 23,
        "content": null
    },
    {
        "id": 35364217,
        "name": "America",
        "nameMn": "Америк",
        "parent": 0,
        "link": null,
        "published": true,
        "listOrder": 24,
        "content": null
    },
    {
        "id": 35364218,
        "name": "USA",
        "nameMn": "АНУ",
        "parent": 35364217,
        "link": "https://www.usa.gov/statistics",
        "published": true,
        "listOrder": 25,
        "content": null
    },
    {
        "id": 47923113,
        "name": "Brazil",
        "nameMn": "Бразил",
        "parent": 35364217,
        "link": "https://www.ibge.gov.br/en/home-eng.html",
        "published": true,
        "listOrder": 26,
        "content": null
    },
    {
        "id": 48160504,
        "name": "Venezuela",
        "nameMn": "Венесуэл",
        "parent": 35364217,
        "link": "http://www.ine.gov.ve/",
        "published": true,
        "listOrder": 27,
        "content": null
    },
    {
        "id": 35364219,
        "name": "Canada",
        "nameMn": "Канад",
        "parent": 35364217,
        "link": "https://www.statcan.gc.ca/en/start",
        "published": true,
        "listOrder": 28,
        "content": null
    },
    {
        "id": 47923121,
        "name": "Cuba",
        "nameMn": "Куба",
        "parent": 35364217,
        "link": "https://globaledge.msu.edu/global-resources/resource/5890",
        "published": true,
        "listOrder": 29,
        "content": null
    },
    {
        "id": 47923126,
        "name": "Colombia",
        "nameMn": "Колумб",
        "parent": 35364217,
        "link": "https://www.dane.gov.co/index.php/en/",
        "published": true,
        "listOrder": 30,
        "content": null
    },
    {
        "id": 35364220,
        "name": "Mexico",
        "nameMn": "Мексик",
        "parent": 35364217,
        "link": "https://ghdx.healthdata.org/organizations/national-institute-statistics-and-geography-inegi-mexico",
        "published": true,
        "listOrder": 31,
        "content": null
    },
    {
        "id": 48160505,
        "name": "Jamaica",
        "nameMn": "Ямайка",
        "parent": 35364217,
        "link": "https://statinja.gov.jm/",
        "published": true,
        "listOrder": 32,
        "content": null
    },
    {
        "id": 47923128,
        "name": "Africa",
        "nameMn": "Африк",
        "parent": 0,
        "link": null,
        "published": true,
        "listOrder": 33,
        "content": null
    },
    {
        "id": 47923124,
        "name": "Algeria",
        "nameMn": "Алжир",
        "parent": 47923128,
        "link": "https://ghdx.healthdata.org/organizations/national-office-statistics-algeria",
        "published": true,
        "listOrder": 34,
        "content": null
    },
    {
        "id": 48807904,
        "name": "Ghana",
        "nameMn": "Гана",
        "parent": 47923128,
        "link": "https://www.statsghana.gov.gh/",
        "published": true,
        "listOrder": 35,
        "content": null
    },
    {
        "id": 47923125,
        "name": "Madagascar",
        "nameMn": "Мадагаскар",
        "parent": 47923128,
        "link": "http://www.instat.mg/",
        "published": true,
        "listOrder": 36,
        "content": null
    },
    {
        "id": 47923129,
        "name": "Morocco",
        "nameMn": "Марокко",
        "parent": 47923128,
        "link": "https://www.men.gov.ma/en/Pages/Statistics.aspx",
        "published": true,
        "listOrder": 37,
        "content": null
    },
    {
        "id": 48807903,
        "name": "Nigeria",
        "nameMn": "Нигери",
        "parent": 47923128,
        "link": "https://www.nigerianstat.gov.ng/",
        "published": true,
        "listOrder": 38,
        "content": null
    },
    {
        "id": 47923131,
        "name": "Tunisia",
        "nameMn": "Тунис",
        "parent": 47923128,
        "link": "http://www.ins.tn/en",
        "published": true,
        "listOrder": 39,
        "content": null
    },
    {
        "id": 47923111,
        "name": "Europe",
        "nameMn": "Европ",
        "parent": 0,
        "link": null,
        "published": true,
        "listOrder": 40,
        "content": null
    },
    {
        "id": 47923133,
        "name": "Austria",
        "nameMn": "Австри",
        "parent": 47923111,
        "link": "https://www.statistik.at/en",
        "published": true,
        "listOrder": 41,
        "content": null
    },
    {
        "id": 47923134,
        "name": "Belarus",
        "nameMn": "Беларусь",
        "parent": 47923111,
        "link": "https://www.belstat.gov.by/en/",
        "published": true,
        "listOrder": 42,
        "content": null
    },
    {
        "id": 47923138,
        "name": "United Kingdom",
        "nameMn": "Британи",
        "parent": 47923111,
        "link": "https://www.ons.gov.uk/",
        "published": true,
        "listOrder": 43,
        "content": null
    },
    {
        "id": 47923108,
        "name": "Germany",
        "nameMn": "Герман",
        "parent": 47923111,
        "link": "https://www.destatis.de/EN/Home/_node.html",
        "published": true,
        "listOrder": 44,
        "content": null
    },
    {
        "id": 47923135,
        "name": "Georgia",
        "nameMn": "Гүрж",
        "parent": 47923111,
        "link": "https://www.geostat.ge/en",
        "published": true,
        "listOrder": 45,
        "content": null
    },
    {
        "id": 47923118,
        "name": "Denmark",
        "nameMn": "Дани",
        "parent": 47923111,
        "link": "https://www.dst.dk/en",
        "published": true,
        "listOrder": 46,
        "content": null
    },
    {
        "id": 47923139,
        "name": "Ireland",
        "nameMn": "Ирланд",
        "parent": 47923111,
        "link": "https://www.cso.ie/en/index.html",
        "published": true,
        "listOrder": 47,
        "content": null
    },
    {
        "id": 47923115,
        "name": "Spain",
        "nameMn": "Испани",
        "parent": 47923111,
        "link": "https://www.ine.es/en/",
        "published": true,
        "listOrder": 48,
        "content": null
    },
    {
        "id": 47923114,
        "name": "Italy",
        "nameMn": "Итали",
        "parent": 47923111,
        "link": "https://www.istat.it/en/",
        "published": true,
        "listOrder": 49,
        "content": null
    },
    {
        "id": 47923136,
        "name": "Luxembourg",
        "nameMn": "Люксембург",
        "parent": 47923111,
        "link": "https://statistiques.public.lu/en.html",
        "published": true,
        "listOrder": 50,
        "content": null
    },
    {
        "id": 47923117,
        "name": "Netherlands",
        "nameMn": "Нидерланд",
        "parent": 47923111,
        "link": "https://www.cbs.nl/en-gb",
        "published": true,
        "listOrder": 51,
        "content": null
    },
    {
        "id": 47923123,
        "name": "Norway",
        "nameMn": "Норвег",
        "parent": 47923111,
        "link": "https://www.ssb.no/en",
        "published": true,
        "listOrder": 52,
        "content": null
    },
    {
        "id": 47923120,
        "name": "Poland",
        "nameMn": "Польш",
        "parent": 47923111,
        "link": "https://stat.gov.pl/en/",
        "published": true,
        "listOrder": 53,
        "content": null
    },
    {
        "id": 48807908,
        "name": "Portugal",
        "nameMn": "Португал",
        "parent": 47923111,
        "link": "https://www.ine.pt/xportal/xmain?xpgid=ine_main&xpid=INE",
        "published": true,
        "listOrder": 54,
        "content": null
    },
    {
        "id": 47923116,
        "name": "Turkey",
        "nameMn": "Турк",
        "parent": 47923111,
        "link": "https://www.tuik.gov.tr/Home/Index",
        "published": true,
        "listOrder": 55,
        "content": null
    },
    {
        "id": 47923127,
        "name": "Finland",
        "nameMn": "Финланд",
        "parent": 47923111,
        "link": "https://www.stat.fi/index_en.html",
        "published": true,
        "listOrder": 56,
        "content": null
    },
    {
        "id": 47923130,
        "name": "Sweden",
        "nameMn": "Швед",
        "parent": 47923111,
        "link": "https://www.scb.se/en/",
        "published": true,
        "listOrder": 57,
        "content": null
    },
    {
        "id": 47923132,
        "name": "Ukraine",
        "nameMn": "Украин",
        "parent": 47923111,
        "link": "https://www.lv.ukrstat.gov.ua/eng/select.php?m=site",
        "published": true,
        "listOrder": 58,
        "content": null
    },
    {
        "id": 47923119,
        "name": "Hungary",
        "nameMn": "Унгар",
        "parent": 47923111,
        "link": "https://www.ksh.hu/?lang=en",
        "published": true,
        "listOrder": 59,
        "content": null
    }
];

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
        if(dialogType === 101){
            const localizedData = GOVERNMENTAL_ORGANIZATIONS_NAVITEMS.map(item => ({
                ...item,
                displayName: lng === "mn" ? item.nameMn : item.name
            }));
            setNavData(localizedData);
        }
        if(dialogType === 100){
            const localizedData = BRANCH_SITES_NAVITEMS.map(item => ({
                ...item,
                displayName: lng === "mn" ? item.nameMn : item.name
            }));
            setNavData(localizedData);
        }
        if(dialogType === 99){
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
                                    <a href={`${lng === "mn" ? "www.nso.mn/mn/terms_of_use" : 'www.nso.mn/en/terms_of_use'}`} target="_blank" rel="noopener noreferrer">
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
                lng={lng}
                visible={dialogOpen}
                onClose={() => setDialogOpen(false)}
                data={navData}
            />
        </div>
    );
}
