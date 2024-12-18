import React from 'react';

export default function Welcome() {
    return (
        <>
            <div className="welcome" >
                <div className="inside">
                    <div className="logo">
                        <img src="/images/welcomepage/Logos.png" style={{ width: 120 }} />
                    </div>
                    <div className="logo_text">
                        ҮНДЭСНИЙ
                        <br />
                        СТАТИСТИКИЙН ХОРОО
                    </div>
                    <div className="center">
                        <div className="bottom-text">Статистикийн Мэдээллийн Нэгдсэн Сан</div>
                        <div className="top-text">БИД СИСТЕМИЙН ШИНЭЧЛЭЛТ ХИЙЖ БАЙНА</div>
                        <div className="top-text">ТА ТҮР ХҮЛЭЭНЭ ҮҮ.</div>
                    </div>
                </div>
                <div className="nso_footer">
                    <div className="__sub_footer">
                        <div className="nso_container">
                            <div className="__wrap_between">
                                <ul>
                                    <li><span></span></li>
                                    <li><span></span></li>
                                    <li><span></span></li>
                                    <li><span></span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
