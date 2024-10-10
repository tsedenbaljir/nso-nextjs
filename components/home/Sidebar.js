import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
    const menus = [
        {
            name: "Хүн амын тоо",
            link: "https://1212.mn/mn",
            desc: "2023-12-31",
            phone: "3 504 741",
            success: "1.4 % ",
            url: "https://downloads.1212.mn/n_OG4sC53x9SPZs-4JwinE0c-wRpZ_--_mls2-Zw.png"
        },
        {
            name: " Инфляцын түвшин ",
            link: "https://data.nso.mn",
            desc: "2024-07-31",
            phone: "5.5",
            success: " % ",
            url: "https://downloads.1212.mn/508Md-xy_eD-WNdyAJ_5jxjuJ5XOw-G37RFVast_.png"
        },
        {
            name: " Дотоодын нийт бүтээгдэхүүн ",
            link: "https://1212.mn/mn",
            desc: "2024-06-30",
            phone: " 37.4 их наяд ",
            success: " 5.6 % ",
            url: "https://downloads.1212.mn/YY2lPbolIQMlEAC8QFiHSuj7fQtYwi7YgNdTfyhi.png"
        },
        {
            name: " Ажилгүйдлийн түвшин ",
            link: "https://1212.mn/mn",
            desc: "2024-03-31",
            phone: "5.2",
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
                                    <span className="success">{dt.success}</span>
                                </div>
                            </div>
                        </Link>
                    })
                }
            </div>
        </div>
    );
}
