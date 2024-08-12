"use client"
import Image from 'next/image';
import Link from 'next/link';

const HomeSection = ({ indicators, covidInfo, searchData }) => {
    return (
        <>
            <div className="nso_container">
                <div className="__home_groups">
                    <div className="__info_area">
                        {/* <div className="__main_search current_space">
                            hello
                        </div> */}
                        <div className="__metadata">
                            <a href="https://data.nso.mn" className="__dock_item" target="_blank">
                                <Image
                                    src="/images/metaIcon.png"
                                    width={30}
                                    height={30}
                                    alt="Meta Icon"
                                />
                                <span>ТӨРИЙН НЭГДСЭН<br />ӨГӨГДЛИЙН САН</span>
                            </a>
                            <a href="http://metadata.nso.mn" className="__dock_item" target="_blank">
                                <Image
                                    src="/images/dataIcon.png"
                                    width={30}
                                    height={30}
                                    alt="Data Icon"
                                />
                                <span>ТӨРИЙН МЕТА ӨГӨГДЛИЙН<br />НЭГДСЭН САН</span>
                            </a>
                        </div>
                    </div>

                    <div className="__group">
                        <div className="__card_area">
                            <Link href="www.1212.mn" target='blank' className="__card">
                                <span
                                    className="__icon"
                                    style={{
                                        backgroundImage: `url('/images/dataIcon.png')`,
                                    }}
                                ></span>
                                <span className="__desc">
                                    www.1212.mn
                                </span>
                                <span className="__name">
                                    Статистикийн мэдээллийн нэгдсэн сан
                                </span>
                            </Link>
                            <div className="__card">
                                {/* <span
                                    className="__icon"
                                    style={{
                                        backgroundImage: `url('https://downloads.1212.mn/${indicator.image}')`,
                                    }}
                                ></span> */}
                                <span className="__desc">
                                    2024-05-22
                                </span>
                                <span className="__name">
                                    www.1212.mn
                                </span>
                            </div>
                            <div className="__card">
                                {/* <span
                                    className="__icon"
                                    style={{
                                        backgroundImage: `url('https://downloads.1212.mn/${indicator.image}')`,
                                    }}
                                ></span> */}
                                <span className="__desc">
                                    2024-05-22
                                </span>
                                <span className="__name">
                                    www.1212.mn
                                </span>
                            </div>
                            <div className="__card">
                                {/* <span
                                    className="__icon"
                                    style={{
                                        backgroundImage: `url('https://downloads.1212.mn/${indicator.image}')`,
                                    }}
                                ></span> */}
                                <span className="__desc">
                                    2024-05-22
                                </span>
                                <span className="__name">
                                    www.1212.mn
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="nso_home_statistic">
                <div class="nso_container">
                    <span class="__group_title">СТАТИСТИК</span>
                </div>
            </div>
        </>
    );
};

export default HomeSection;
