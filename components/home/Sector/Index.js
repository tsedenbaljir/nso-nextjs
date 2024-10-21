import React from 'react';
import Link from 'next/link';

export default function Index() {
    return (
        <>
            <div className="nso_home_statistic">
                <div className="nso_container">
                    <span className="__group_title">Статистик</span>
                </div>
                <div className="nso_container">
                    <div className="__statistic_groups">
                        <div className="__group">
                            <div className="__statistics">
                                <Link className="__card" href="http://10.0.1.55/pxweb/pxweb/mn/NSO/">
                                    <span className="__icon"></span>
                                    <span className="__name">Хүн ам, өрх</span>
                                </Link>
                                <Link className="__card" href="http://10.0.1.55/pxweb/pxweb/mn/NSO/">
                                    <span className="__icon"></span>
                                    <span className="__name">Үйлдвэрлэл, үйлчилгээ</span>
                                </Link>
                                <Link className="__card" href="http://10.0.1.55/pxweb/pxweb/mn/NSO/">
                                    <span className="__icon"></span>
                                    <span className="__name">Нийгэм, хөгжил</span>
                                </Link>
                                <Link className="__card" href="http://10.0.1.55/pxweb/pxweb/mn/NSO/">
                                    <span className="__icon"></span>
                                    <span className="__name">Эдийн засаг, байгаль орчин</span>
                                </Link>
                                <Link className="__card" href="http://10.0.1.55/pxweb/pxweb/mn/NSO/">
                                    <span className="__icon"></span>
                                    <span className="__name">Боловсрол, эрүүл мэнд</span>
                                </Link>
                                <Link className="__card" href="http://10.0.1.55/pxweb/pxweb/mn/NSO/">
                                    <span className="__icon"></span>
                                    <span className="__name">Хөдөлмөр, бизнес</span>
                                </Link>
                            </div>
                        </div>
                        <div className="__group">
                            <div className="__highlight">
                                <div className="__card">
                                    <span className="__desc">2023-12-31</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: 'url("https://downloads.1212.mn/tIvK--fOd--8ycP-bO-TwA_mR6_O7-w67Rma2T-r.png")' }}></span>
                                        Малын тоо*
                                    </span>
                                    <span className="__count">64.7 сая</span>
                                </div>
                                <div className="__card">
                                    <span className="__desc">2024-01-01</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: 'url("https://downloads.1212.mn/508Md-xy_eD-WNdyAJ_5jxjuJ5XOw-G37RFVast_.png")' }}></span>
                                        Голч цалин
                                    </span>
                                    <span className="__count">2.5 сая</span>
                                </div>
                                <div className="__card">
                                    <span className="__desc">2024-12-01</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: 'url("https://downloads.1212.mn/508Md-xy_eD-WNdyAJ_5jxjuJ5XOw-G37RFVast_.png")' }}></span>
                                        Өрхийн сарын дундаж орлого
                                    </span>
                                    <span className="__count">2 сая</span>
                                </div>
                                <div className="__card">
                                    <span className="__desc">2023-12-20</span>
                                    <span className="__title">
                                        <span className="__icon" style={{ backgroundImage: 'url("https://downloads.1212.mn/6ULXrEi2_5d0-UAql-_DYpEx-Dn3TMi4rw6-pG-6.png")' }}></span>
                                        Ажиллах хүчний оролцоо
                                    </span>
                                    <span className="__count">62.2 %</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
