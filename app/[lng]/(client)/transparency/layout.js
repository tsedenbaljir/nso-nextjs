"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { useTranslation } from '@/app/i18n/client';
import { BreadCrumb } from 'primereact/breadcrumb';
import TextLoading from '@/components/Loading/OneField/Index';

export default function TransparencyLayout({ children, params: { lng } }) {

    const { id, name } = useParams();
    const { t } = useTranslation(lng, "lng", "");
    const isMn = lng === 'mn';

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const getTransparency = async () => {
        await fetch(`/api/transparency/${id}`, {
            cache: "no-store",
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.status) setData(res.data);
            })
            .finally(() => setLoading(false));
    }
    useEffect(() => {
        if (id) {
            getTransparency()
        }
        setLoading(false);
    }, [id]);

    var breadMap = [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('transparency'), url: [lng === 'mn' ? '/mn/transparency' : '/en/transparency'] }
    ];
    if(name) breadMap.push({ label: name ? decodeURIComponent(name) : ""});
    // if(!loading) breadMap.push({ label: data.title });

    return (
        <>
            <div className="about_us_header">
                <div className="nso_page_header">
                    <div className="nso_container">
                        <div className="__header">
                            <span className="__page_name">
                                {t("transparency")}
                            </span>
                            {loading ? <TextLoading /> : <BreadCrumb model={breadMap} />}
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