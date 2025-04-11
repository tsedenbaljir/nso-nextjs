"use client"
import React from 'react';
import { useTranslation } from '@/app/i18n/client';
import { BreadCrumb } from 'primereact/breadcrumb';

export default function Statecate({ children, params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");
    const isMn = lng === 'mn';

    const breadMap = [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('transparency'), url: [lng === 'mn' ? '/mn/transparency' : '/en/transparency'] },
    ];

    return (
        <>
            <div className="about_us_header">
                <div className="nso_page_header">
                    <div className="nso_container">
                        <div className="__header">
                            <span className="__page_name">
                                {t("transparency")}
                            </span>
                            <BreadCrumb model={breadMap} />
                        </div>
                        {isMn && (
                            <div className="__header" style={{ marginLeft: '20px' }}>
                                <a
                                    href="https://iaac.mn/"
                                    className="__page_name"
                                    style={{
                                        display: 'flex',
                                        textDecoration: 'none',
                                        marginLeft: '20px',
                                        padding: '0 10px',
                                        borderRadius: '10px',
                                        background: 'white',
                                        boxShadow: '0px 3px 2px'
                                    }}
                                >
                                    <span
                                        className="p-breadcrumb p-component"
                                        style={{ color: 'red', fontSize: '40px' }}
                                    >
                                        110
                                    </span>
                                    <span className="p-breadcrumb p-component" style={{ margin: '10px' }}>
                                        Шударга ёс хөгжилд дэвшилд гомдол <br />
                                        мэдээлэл хүлээн авах утас
                                    </span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {children}
        </>
    );
}