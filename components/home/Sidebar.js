import React from 'react';
import Link from 'next/link';

export default function Sidebar({ t, lng }) {
    const menus = [
        {
            name: t('stats.pop1'),
            link: `${process.env.BASE_FRONT_URL}/pxweb/${lng}/NSO/NSO__Pop__pop1/DT_NSO_0300_004V5.px/`,
            desc: "2023-12-31",
            phone: "3 504 741",
            success: "1.4 % ",
            url: "https://downloads.1212.mn/n_OG4sC53x9SPZs-4JwinE0c-wRpZ_--_mls2-Zw.png"
        },
        {
            name: t('stats.pop2'),
            link: `${process.env.BASE_FRONT_URL}/pxweb/${lng}/NSO/NSO__Economy,%20environment__economy_consumerPrice/DT_NSO_0600_010V1.px/`,
            desc: "2024-07-31",
            phone: "9",
            success: "%",
            url: "https://downloads.1212.mn/508Md-xy_eD-WNdyAJ_5jxjuJ5XOw-G37RFVast_.png"
        },
        {
            name: t('stats.pop3'),
            link: `${process.env.BASE_FRONT_URL}/pxweb/${lng}/NSO/NSO__Economy,%20environment__economy_national_acc/DT_NSO_0500_022V1.px/`,
            desc: "2024-06-30",
            phone: "56.2 их наяд",
            success: " 5.0 % ",
            url: "https://downloads.1212.mn/YY2lPbolIQMlEAC8QFiHSuj7fQtYwi7YgNdTfyhi.png"
        },
        {
            name: t('stats.pop4'),
            link: `${process.env.BASE_FRONT_URL}/pxweb/${lng}/NSO/NSO__Labor__Labor/DT_NSO_0400_020V2.px/`,
            desc: "2024-03-31",
            phone: "6.1",
            success: "%",
            url: "https://downloads.1212.mn/Soxj74qhkwXV_xUwebd_XFnwa_-vVaH05-T-XoYJ.png"
        },
    ];
    return (
        <div className="__group">
            <div className="__card_area">
                {
                    menus.map((dt, index) => {
                        return <Link href={dt.link} key={index} target='blank' className="__card">
                            <span className="__icon"
                                style={{
                                    backgroundImage: `url('${dt.url}')`,
                                }}
                            ></span>
                            <span className="__desc">{dt.desc}</span>
                            <span className="__name">{dt.name}</span>
                            <div className="__phone">
                                <span style={{ marginTop: 10, fontSize: index === 2 && 14 }}> {dt.phone} </span>
                                <div className="ng-star-inserted">
                                    {dt.success === "%" ? <span className="text-lg">{dt.success}</span> : <span className="success">{dt.success}</span>}
                                </div>
                            </div>
                        </Link>
                    })
                }
            </div>
        </div>
    );
}
