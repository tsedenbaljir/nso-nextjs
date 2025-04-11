"use client"
import React, { useState } from 'react';
import TimeLine from '@/components/about-us/time-line';
import Orgs from '@/components/about-us/orgs';
import "@/components/styles/about-us.scss";

export default function AboutUs({ params: { lng } }) {
    const [activeItem, setActiveItem] = useState(0);

    const tabMenus = [
        { label: "Эрхэм зорилго" },
        { label: "Алсын хараа" }
    ];

    const activateMenu = (index) => {
        setActiveItem(index);
    };
    
    return (
        <>
            <div className="nso_about_us_body">
                <div className="nso_container">
                    <div className="__nso_desc">
                        <div className="__about h-[300px]">
                            <div className="__top_text">
                                Үндэсний Статистикийн Хороо
                            </div>
                            <div className="__sub_body">
                                <div className="card">
                                    <div className="__statistic_groups">
                                        <div className="nso_tab">
                                            <div className="tab_menu">
                                                {/* Tabs */}
                                                {tabMenus.map((item, i) => (
                                                    <span
                                                        key={i}
                                                        className={`tab_item text-base cursor-pointer ${activeItem === i ? 'active' : ''}`}
                                                        onClick={() => activateMenu(i)}
                                                        style={{fontWeight: `${activeItem === i ? '600' : ''}`}}
                                                    >
                                                        {item.label}
                                                    </span>
                                                ))}
                                            </div>
                                            {/* Tab content */}
                                            <div className="nso_tab_content">
                                                {activeItem === 0 && (
                                                    <div className="__desc_text text-lg">
                                                        <span>Бид Монгол Улсын статистик мэдээллийг шинжлэх ухааны үндэслэлтэйгээр эрхлэн гаргаж, хэрэглэгчдэд адил тэгш үйлчилнэ.
                                                        </span>
                                                    </div>
                                                )}
                                                {activeItem === 1 && (
                                                    <div className="__desc_text text-lg">
                                                        <span>Статистик хэрэглэгчдийг чанартай тоон мэдээллээр хангаж, нотолгоонд суурилсан бодлого, шийдвэрийн залгамжийг тасралтгүй хадгалан, статистикийн чадавхаараа дэлхийд тэргүүлнэ.
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <img
                            width="500px"
                            height="300px"
                            className="__about_img"
                            src="/about.png"
                            alt="About Us"
                        />
                    </div>
                </div>
            </div>
            <Orgs lng={lng} />
            <TimeLine lng={lng} />
        </>
    );
}
