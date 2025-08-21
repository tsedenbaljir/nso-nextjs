"use client"
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/client';
import datamn from './json/data_mn.json';
import dataen from './json/data_en.json';
import Path from '@/components/path/Index';
import { Timeline } from 'primereact/timeline';

import { Dialog } from 'primereact/dialog';

export default function Orgs({ lng }) {
    const { t } = useTranslation(lng, "lng", "");
    const [daraga, setDaraga] = useState(false);
    const [whereDaraga, setWhereDaraga] = useState(null);
    const [breadMapDaraga, setBreadMapDaraga] = useState([]);
    const [gazar, setGazar] = useState(false);
    const [where, setWhere] = useState(null);
    const [breadMapGazar, setBreadMapGazar] = useState([]);

    const datas = lng === "mn" ? datamn.gazar : dataen.gazar;
    const daragaData = lng === "mn" ? datamn.daraga : dataen.daraga;

    useEffect(() => {
        // Any initialization logic can go here
    }, []);

    const showDialogDaraga = (whereIs) => {
        setDaraga(true);
        setWhereDaraga(whereIs - 1);
        setBreadMapDaraga([
            { label: t('home'), url: [lng === 'mn' ? 'mn' : 'en'] },
            { label: t('aboutUs') },
            { label: t('orgStructure') },
            { label: daragaData[whereIs - 1].title }
        ]);
    };

    const showDialoggazar = (whereIs) => {
        setGazar(true);
        setWhere(whereIs - 1);
        setBreadMapGazar([
            { label: t('home'), url: [lng === 'mn' ? 'mn' : 'en'] },
            { label: t('aboutUs') },
            { label: t('orgStructure') },
            { label: datas[whereIs - 1].title }
        ]);
    };

    return (
        <>
            <div className="nso_container mtMB" style={{ width: "100%", background: "var(--surface-bk3)" }}>
                <div className="nso_container" >
                    <div>
                        {daraga && (
                            <Dialog header={
                                <Path name={''} breadMap={breadMapDaraga} />
                            } visible={daraga} baseZIndex={10000} modal onHide={() => setDaraga(false)}>
                                <div>
                                    <div className="title" style={{ color: "#333a3f", fontWeight: 700, fontSize: "xx-large", marginLeft: 20 }}>{daragaData[whereDaraga].title}</div>
                                    <div className="dialog-body">
                                        <div className="sb">
                                            <div className="name">
                                                <div className="name_bg"></div>
                                                <img src={daragaData[whereDaraga].imgSrc} alt="Daraga" />
                                                <h5 style={{ color: "var(--accent)", fontWeight: 700 }}>{daragaData[whereDaraga].fullName}</h5>
                                            </div>
                                            <div className="desc">
                                                <p>{daragaData[whereDaraga].year}</p>
                                                <h4>
                                                    <div className="ws_desc" dangerouslySetInnerHTML={{ __html: daragaData[whereDaraga].status }}></div>
                                                </h4>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="header">
                                                <div className="title">{t('orgEducation')}</div>
                                                {daragaData[whereDaraga].education.map((education, index) => (
                                                    <div className="bfr" key={index}>
                                                        <p className="f">{education.edu}</p>
                                                        <p className="s">{education.year}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="body">
                                                <div className="title">{t('WorkExperience')}</div>
                                                <Timeline value={daragaData[whereDaraga].history}
                                                    content={(event) => (
                                                        <div>
                                                            <div className="time_line_title">{event.job}</div>
                                                            <div className="date">{event.year}</div>
                                                        </div>
                                                    )}
                                                    marker={(event) => (
                                                        <div className="__middlecircle">
                                                            <div className="mc"></div>
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Dialog>
                        )}

                        {gazar && (
                            <Dialog header={
                                <Path name={''} breadMap={breadMapGazar} />
                            } visible={gazar} baseZIndex={10000} modal onHide={() => setGazar(false)}>
                                <div className="title" style={{ color: "#333a3f", fontWeight: 700, fontSize: "xx-large", marginLeft: 20 }}>{datas[where].title}</div>
                                <div className="dialog-body">
                                    <div className="header">
                                        <div className="title">{t('Goals')}</div>
                                        <div className="bfr">
                                            <div>{datas[where].goals}</div>
                                        </div>
                                        <br />
                                        <div className="title">
                                            {datas[where].id !== 24 ? t('Objective') : 'Даргын зөвлөлийн хурлын гишүүд: '}
                                        </div>
                                        <div className="bfr">
                                            <div>
                                                {datas[where].Objective.map((data, index) => (
                                                    <p key={index}>
                                                        {index + 1}. {data.title}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                        {lng === "mn" && (
                                            <>
                                                <div className="title">
                                                    {datas[where].id === 24 ? "Даргын зөвлөлийн хурлын хуралдааны дэг:" :
                                                        datas[where].id !== 16 ? "Чиг үүрэг" : ""}
                                                </div>
                                                <div className="bfr">
                                                    <div>
                                                        {datas[where].duties.map((data, index) => (
                                                            <p key={index}>
                                                                {index + 1}. {data.title}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {datas[where].id === 24 && (
                                            <>
                                                <br />
                                                <a className="underline" href="/uploads/16p_4dRstR2UyuZ-_tJK9cikjthfYtkQ47JZ64y-.pdf" target="_blank">
                                                    ДЗХ-ын ажиллах журам 2021 А72
                                                </a>
                                                <br />
                                                <a className="underline" href="/uploads/9PwHbeEV1P9Sv_ZIXsiccOiPAHrSRB-UX1_Nwk0e.pdf" target="_blank">
                                                    ДЗ бүрэлдэхүүн шинэчилсэн баталсан тухай 2023 оны А105
                                                </a>
                                                <br />
                                                <a className="underline" href="/uploads/P4rQhUz5Qba8trdnzPkj1q3Vx-crSIq8_o_HMwS6.pdf" target="_blank">
                                                    ДЗХ-ын 2024 оны төлөвлөгөө 5
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Dialog>
                        )}
                    </div>
                    <div>
                        <div className="__timeline_title">
                            {t('orgStructure')}
                        </div>
                        <div className='ifMobile'>
                            <div className="containers mt-7 mb-7">
                                <div className="grid w-full grid-cols-3 gap-3 level-top">
                                    <h5 className="level-0 text-center rectangle" onClick={() => { showDialoggazar(26) }}
                                        dangerouslySetInnerHTML={{ __html: t('aboutUsJson.VSZ') }}>
                                    </h5>
                                    <h4 className="level-1 rectangle text-center" onClick={() => { showDialogDaraga(1) }}
                                        dangerouslySetInnerHTML={{ __html: t('aboutUsJson.D1') }}>
                                    </h4>
                                    <h5 className="level-0 text-center rectangle" onClick={() => { showDialoggazar(25) }}
                                        dangerouslySetInnerHTML={{ __html: t('aboutUsJson.DZ') }}>
                                    </h5>
                                </div>
                                <ol className="level-2-wrapper">
                                    <li>
                                        <h5 className="level-2 rectangle text-center" onClick={() => { showDialogDaraga(2) }}
                                            dangerouslySetInnerHTML={{ __html: t('aboutUsJson.D2') }}></h5>
                                        <ol className="level-3-wrapper">
                                            <li className="lvlded">
                                                <h5 className="level-3 rectangle text-center" onClick={() => { showDialoggazar(27) }}
                                                    dangerouslySetInnerHTML={{ __html: t('aboutUsJson.AZBZ') }}></h5>
                                            </li>
                                            <li className="lvltamga">
                                                <h5 className="level-3 rectangle text-center" onClick={() => { showDialogDaraga(3) }}
                                                    dangerouslySetInnerHTML={{ __html: t('aboutUsJson.D3') }}>
                                                </h5>
                                            </li>
                                            <div className="hrs"></div>
                                        </ol>
                                    </li>
                                    <li>
                                        <h5 className="level-2 rectangle text-center" style={{ width: 236, marginTop: 200 }} onClick={() => { showDialoggazar(20) }}>
                                            {t('aboutUsJson.G6')}
                                        </h5>
                                    </li>
                                </ol>
                            </div>
                            {/* <div className="lines">
                            </div> */}
                            <div className="containers mt-7 mb-7">
                                <ol className="level-22-wrapper">
                                    <ol className="level-32-wrapper">
                                        <li className="lvltamga">
                                            <h5 className="level-32 rectangle" onClick={() => { showDialoggazar(2) }} dangerouslySetInnerHTML={{ __html: t('aboutUsJson.G1') }}>
                                            </h5>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(6) }}>{t('aboutUsJson.G1x1')}</h5>
                                                </li>
                                            </ol>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(5) }}>{t('aboutUsJson.G1x2')}</h5>
                                                </li>
                                            </ol>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(4) }}>{t('aboutUsJson.G1x3')}</h5>
                                                </li>
                                            </ol>
                                        </li>
                                        <li className="lvltamga">
                                            <h5 className="level-32 rectangle" onClick={() => { showDialoggazar(24) }} dangerouslySetInnerHTML={{ __html: t('aboutUsJson.G2') }}>
                                            </h5>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(7) }}>{t('aboutUsJson.G2x1')}</h5>
                                                </li>
                                            </ol>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(8) }}>{t('aboutUsJson.G2x2')}</h5>
                                                </li>
                                            </ol>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(9) }}>{t('aboutUsJson.G2x3')}</h5>
                                                </li>
                                            </ol>
                                        </li>
                                        <li className="lvltamga">
                                            <h5 className="level-32 rectangle" onClick={() => { showDialoggazar(10) }} dangerouslySetInnerHTML={{ __html: t('aboutUsJson.G3') }}>
                                            </h5>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(12) }}>{t('aboutUsJson.G3x1')}</h5>
                                                </li>
                                            </ol>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(11) }}>{t('aboutUsJson.G3x2')}
                                                    </h5>
                                                </li>
                                            </ol>
                                        </li>
                                        <li className="lvltamga">
                                            <h5 className="level-32 rectangle" style={{ width: 220 }} onClick={() => { showDialoggazar(13) }} dangerouslySetInnerHTML={{ __html: t('aboutUsJson.G4') }}>
                                            </h5>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(16) }}>{t('aboutUsJson.G4x1')}
                                                    </h5>
                                                </li>
                                            </ol>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(14) }}>{t('aboutUsJson.G4x2')}
                                                    </h5>
                                                </li>
                                            </ol>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(15) }}>{t('aboutUsJson.G4x3')}</h5>
                                                </li>
                                            </ol>
                                        </li>
                                        <li className="lvltamga">
                                            <h5 className="level-32 rectangle" onClick={() => { showDialoggazar(21) }} dangerouslySetInnerHTML={{ __html: t('aboutUsJson.G5') }}>
                                            </h5>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(22) }}>{t('aboutUsJson.G5x1')}</h5>
                                                </li>
                                            </ol>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(23) }}>{t('aboutUsJson.G5x2')}</h5>
                                                </li>
                                            </ol>
                                        </li>
                                        <li className="lvltamga">
                                            <h5 className="level-32 rectangle text-center" onClick={() => { showDialoggazar(1) }}
                                                dangerouslySetInnerHTML={{ __html: t('aboutUsJson.G7') }}></h5>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(18) }}>{t('aboutUsJson.G7x1')}</h5>
                                                </li>
                                            </ol>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(17) }}>{t('aboutUsJson.G7x2')}</h5>
                                                </li>
                                            </ol>
                                            <ol className="level-4-wrapper">
                                                <li>
                                                    <h5 className="level-4 rectangle" onClick={() => { showDialoggazar(19) }}>{t('aboutUsJson.G7x3')}</h5>
                                                </li>
                                            </ol>
                                        </li>
                                    </ol>
                                </ol>
                            </div>
                        </div>
                        {/* </>} */}
                    </div>
                </div>
            </div>
        </>
    );
}
