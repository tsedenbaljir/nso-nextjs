"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs } from 'antd';
import Layout from '@/components/baseLayout';
import { useTranslation } from '@/app/i18n/client';
import LoadingDiv from '@/components/Loading/Text/Index';
import '@/components/styles/contact-us.scss';

export default function Contact({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");
    const [contactData, setContactData] = useState(null);
    const [contactDataProvince, setContactDataProvince] = useState(null);
    const [webpageData, setWebpageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch webpage content
                const webpageResponse = await axios.get('/api/webpage', {
                    params: {
                        slug: 'contact',
                        language: lng.toUpperCase()
                    }
                });
                if (webpageResponse.data) {
                    setWebpageData(webpageResponse.data);
                }

                // Existing contact phones fetch
                const contactResponse = await axios.get('https://gateway.1212.mn/services/1212/api/public/contents', {
                    params: {
                        'slug.equals': 'contact-phones',
                        'language.equals': lng.toUpperCase()
                    }
                });
                if (contactResponse.data && contactResponse.data.length > 0) {
                    setContactData(contactResponse.data[0]);
                }

                // Existing province data fetch
                const provinceResponse = await axios.get('https://gateway.1212.mn/services/1212/api/public/contents', {
                    params: {
                        'slug.equals': 'Contact-province',
                        'language.equals': lng.toUpperCase()
                    }
                });
                if (provinceResponse.data && provinceResponse.data.length > 0) {
                    setContactDataProvince(provinceResponse.data[0]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [lng]);

    const items = [
        {
            key: '1',
            label: <span className="font-bold">{lng === "mn" ? 'Хаяг байршил' : 'Address'}</span>,
            className: 'contact_tab_item',
            children: (
                <div style={{ width: '100%' }}>
                    {loading ? (
                        <div className="text-center py-4"><LoadingDiv /></div>
                    ) : (
                        <>
                            <div className="__map w-full" style={{ width: '100%' }}>
                                <iframe
                                    height="450"
                                    className="w-full border-0"
                                    allowFullScreen=""
                                    loading="lazy"
                                    style={{ width: '100%' }}
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2673.8775473613423!2d106.9199552156117!3d47.91940677430989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d9692412b294ed1%3A0x2573645c0869e276!2z0JfQsNGB0LPQuNC50L0g0LPQsNC30YDRi9C9IElJSSDQsdCw0LnRgCwg0KPQu9Cw0LDQvdCx0LDQsNGC0LDRgCAxNDIwMA!5e0!3m2!1smn!2smn!4v1634715651828!5m2!1smn!2smn">
                                </iframe>
                            </div>
                            {webpageData && (
                                <div dangerouslySetInnerHTML={{ __html: webpageData.body }} />
                            )}
                        </>
                    )}
                </div>
            ),
        },
        {
            key: '2',
            label: <span className="font-bold">{lng === "mn" ? 'Утасны жагсаалт' : 'Phone List'}</span>,
            className: 'contact_tab_item',
            children: (
                <div className="contact_tab_item">
                    {loading ? (
                        <div className="text-center py-4"><LoadingDiv /></div>
                    ) : (
                        contactData && (
                            <div dangerouslySetInnerHTML={{ __html: contactData.body }} />
                        )
                    )}
                </div>
            ),
        },
        {
            key: '3',
            label: <span className="font-bold">{lng === "mn" ? 'Орон нутаг' : 'Province'}</span>,
            className: 'contact_tab_item',
            children: (
                <div className="contact_tab_item">
                    {loading ? (
                        <div className="text-center py-4"><LoadingDiv /></div>
                    ) : (
                        contactDataProvince && (
                            <div dangerouslySetInnerHTML={{ __html: contactDataProvince.body }} />
                        )
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <div className='nso_about_us mt-44'>
                <div className='nso_statistic_category'>
                    <div className="nso_container">
                        <Tabs
                            defaultActiveKey="1"
                            items={items}
                            className="contact_tab w-full"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
