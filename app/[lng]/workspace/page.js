"use client"
import React from 'react';
import Layout from '@/components/baseLayout';
import { useTranslation } from '@/app/i18n/client';
import '@/components/styles/laws.scss';

export default function Home({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");

    const array = [...Array(10)]
    const body = () => {
        return <div
            className="__post"
            target="blank"
        >
            <img
                className="__image"
                src="/images/about_us/pdf-logo.png"
                width="36"
                height="47"
            />
            <div className="__laws-body">
                <div className="__title">
                    Нийтийн албанд нийтийн болон хувийн ашиг сонирхлыг зохицуулах, ашиг сонирхлын зөрчлөөс
                    урьдчилан сэргийлэх тухай хууль
                </div>
                <div className="__view_comments">
                    <ul>
                        <li className="__info">
                            <span className="__date">2024.6.2</span>
                        </li>
                    </ul>
                </div>
            </div>
            <img
                className="__download_cloud"
                src="/images/about_us/download-cloud.png"
            />
        </div>
    }
    return (
        <Layout lng={lng}>
            <div className="nso_about_us mt-40">
                <div className="nso_container">
                    <div className="__body">
                        <div className="__menu">
                            <div className="__title">
                                {t('legalMenu.LEGALFUND')}
                            </div>
                            <div className="main">
                                <div className="__laws">
                                    <div className="__info_detail_page">
                                        {
                                            array.map((dt) => {
                                                return body()
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout >
    );
}
