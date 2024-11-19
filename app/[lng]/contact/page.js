"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs } from 'antd';
import Layout from '@/components/baseLayout';
import { useTranslation } from '@/app/i18n/client';

export default function Contact({ params: { lng } }) {
    const { t } = useTranslation(lng);
    const [contactData, setContactData] = useState(null);
    const [contactDataProvince, setContactDataProvince] = useState(null);

    useEffect(() => {
        const fetchContactData = async () => {
            try {
                const response = await axios.get('https://gateway.1212.mn/services/1212/api/public/contents', {
                    params: {
                        'slug.equals': 'contact-phones',
                        'language.equals': lng.toUpperCase()
                    }
                });

                if (response.data && response.data.length > 0) {
                    setContactData(response.data[0]);
                }
            } catch (error) {
                console.error('Error fetching contact data:', error);
            }
            try {
                const response = await axios.get('https://gateway.1212.mn/services/1212/api/public/contents', {
                    params: {
                        'slug.equals': 'Contact-province',
                        'language.equals': lng.toUpperCase()
                    }
                });

                if (response.data && response.data.length > 0) {
                    setContactDataProvince(response.data[0]);
                }
            } catch (error) {
                console.error('Error fetching contact data:', error);
            }
        };

        fetchContactData();
    }, []);

    const items = [
        {
            key: '1',
            label: lng === "mn" ? 'Хаяг байршил' : 'Address',
            children: (
                <div className="contact-content w-full" style={{ width: '100%' }}>
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
                    <div className="contact-info text-center mt-4">
                        <p>{t('footer.address')}: {t('footer.addressText')}</p>
                        <p>{t('footer.infoPhone')}: 70141212, 51-261502</p>
                        <p>{t('footer.mail')}: information@nso.mn, international@nso.mn</p>
                    </div>
                </div>
            ),
        },
        {
            key: '2',
            label: lng === "mn" ? 'Утасны жагсаалт' : 'Phone List',
            children: (
                <div className="" style={{ width: '100%' }}>
                    <div className="contact_tab_item">
                        {contactData && (
                            <div dangerouslySetInnerHTML={{ __html: contactData.body }} />
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: '3',
            label: lng === "mn" ? 'Орон нутаг' : 'Province',
            children: (
                <div className="" style={{ width: '100%' }}>
                    <div className="contact_tab_item">
                        {contactDataProvince && (
                            <div className='contact_tab_item' dangerouslySetInnerHTML={{ __html: contactDataProvince.body }} />
                        )}
                    </div>
                </div>
            ),
        },
    ];

    return (
        <Layout lng={lng}>
            <div className='nso_about_us mt-44'>
                <div className="nso_container">
                    <Tabs
                        defaultActiveKey="1"
                        items={items}
                        className="contact-tabs w-full"
                    />
                </div>
            </div>
        </Layout>
    );
}
