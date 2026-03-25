"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useSearchParams } from 'next/navigation';
import TextLoading from '@/components/Loading/Text/Index';
import Pagination from '@/components/articles/Pagination';
import OneField from '@/components/Loading/OneField/Index';
import './workspace.scss';

export default function Home({ params: { lng } }) {
    const router = useRouter();

    const searchParams = useSearchParams();
    const page = searchParams.get('page') || 1;
    const [expandedIndex, setExpandedIndex] = useState(null);

    // States
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [pagination, setPagination] = useState({
        page: page,
        pageSize: 5,
        total: 0,
        totalPages: 0
    });

    const location = [
        { "id": 41515, "namemn": "Архангай", "nameen": "Arkhangai", "code": "65", "order": 1, "configValues": [] },
        { "id": 41520, "namemn": "Баян-Өлгий", "nameen": "Bayan-Ulgii", "code": "83", "order": 2, "configValues": [] },
        { "id": 41514, "namemn": "Баянхонгор", "nameen": "Bayankhongor", "code": "64", "order": 3, "configValues": [] },
        { "id": 41512, "namemn": "Булган", "nameen": "Bulgan", "code": "63", "order": 4, "configValues": [] },
        { "id": 41519, "namemn": "Говь-Алтай", "nameen": "Govi-Altai", "code": "82", "order": 5, "configValues": [] },
        { "id": 41505, "namemn": "Говьсүмбэр", "nameen": "Govisumber", "code": "42", "order": 6, "configValues": [] },
        { "id": 7051, "namemn": "Дархан-Уул", "nameen": "Darkhan-Uul", "code": "45", "order": 7, "configValues": [] },
        { "id": 41509, "namemn": "Дорноговь", "nameen": "Dornogovi", "code": "44", "order": 8, "configValues": [] },
        { "id": 41510, "namemn": "Дорнод", "nameen": "Dornod", "code": "21", "order": 9, "configValues": [] },
        { "id": 41516, "namemn": "Дундговь", "nameen": "Dundgovi", "code": "48", "order": 10, "configValues": [] },
        { "id": 41518, "namemn": "Завхан", "nameen": "Zavkhan", "code": "81", "order": 11, "configValues": [] },
        { "id": 37303, "namemn": "Орхон", "nameen": "Orkhon", "code": "61", "order": 12, "configValues": [] },
        { "id": 41511, "namemn": "Өвөрхангай", "nameen": "Uvurkhangai", "code": "62", "order": 13, "configValues": [] },
        { "id": 41513, "namemn": "Өмнөговь", "nameen": "Umnugovi", "code": "46", "order": 14, "configValues": [] },
        { "id": 41508, "namemn": "Сүхбаатар", "nameen": "Sukhbaatar", "code": "22", "order": 15, "configValues": [] },
        { "id": 41506, "namemn": "Сэлэнгэ", "nameen": "Selenge", "code": "43", "order": 16, "configValues": [] },
        { "id": 26366625, "namemn": "Бүгд", "nameen": "", "code": "16", "order": 16, "configValues": [] },
        { "id": 37302, "namemn": "Төв", "nameen": "Tuv", "code": "41", "order": 17, "configValues": [] },
        { "id": 41522, "namemn": "Увс", "nameen": "Uvs", "code": "85", "order": 18, "configValues": [] },
        { "id": 41521, "namemn": "Ховд", "nameen": "Khovd", "code": "84", "order": 19, "configValues": [] },
        { "id": 41517, "namemn": "Хөвсгөл", "nameen": "Khuvsgul", "code": "67", "order": 20, "configValues": [] },
        { "id": 41507, "namemn": "Хэнтий", "nameen": "Khentii", "code": "23", "order": 21, "configValues": [] },
        { "id": 37301, "namemn": "Улаанбаатар", "nameen": "Ulaanbaatar", "code": "11", "order": 22, "configValues": [] }
    ];


    const fetchArticles = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/workspace?page=${pagination.page}&pageSize=${pagination.pageSize}&language=${lng}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status) {
                setData(result.data);
                setPagination(prev => ({
                    ...prev,
                    total: result.pagination.total,
                    totalPages: result.pagination.totalPages
                }));
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching articles:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [pagination.page]);


    return (
        <>
            <div className="nso_container">
                <div className="__header flex flex-wrap w-full my-16 mb-8 items-center justify-between text-main">
                    <div className="__title text-2xl font-semibold uppercase">
                        {lng === "mn" ? "Нээлттэй ажлын байр" : "OPEN JOB VACANCY"}
                    </div>
                    {/* <div className="__jf flex items-center">
                        <div className="__jobs-count float-right mr-5">
                            {lng === "mn" ? "Нийт" : "A total of"}
                            <>{loading ? "..." : " " + pagination.total}</> {lng === "mn" ? "ажлын байр" : "jobs"}
                        </div>
                    </div> */}
                </div>
            </div>
            <div className="nso_container">
                <div className="nso_tab_content">
                    <div className="__table">
                        {loading ? <>
                            <TextLoading />
                            <br />
                            <TextLoading />
                            <br />
                            <TextLoading />
                        </> :
                            data.map((dt, index) => {
                                return (
                                    <div
                                        key={index}
                                        className="ws_body pb-10 pt-5"
                                    >
                                        <div className="ws_title text-2xl font-semibold">
                                            {dt.name}
                                        </div>

                                        <div
                                            className="ws_desc my-4 text-base"
                                            dangerouslySetInnerHTML={{
                                                __html: dt.body.length > 250 ? dt.body.substr(0, 500) + '...' : dt.body
                                            }}
                                        ></div>

                                        <ul>
                                            <li className="ws_desc">* {dt.created_date.substr(0, 10)}</li>
                                            <li className="ws_desc" style={{ marginLeft: '50px' }}>
                                                * {
                                                    lng === "mn"
                                                        ? location.find(item => item.code === dt.location)?.namemn
                                                        : location.find(item => item.code === dt.location)?.nameen
                                                }
                                            </li>
                                            <li className="__ws_action_area" >
                                                <button
                                                    className="nso_btn success"
                                                    tabIndex="0"
                                                    onClick={() => router.push(`/${lng}/about-us/workspace/${dt.id}`)}
                                                >
                                                    {lng === 'mn' ? 'Дэлгэрэнгүй' : 'Read more'}
                                                </button>
                                            </li>
                                        </ul>

                                    </div>
                                );
                            })

                        }
                        <div className="nso_container mt-5 mb-5">
                            {loading ? <><OneField /><OneField /><OneField /></> : <Pagination page={parseInt(pagination.page)} mainPath={"about-us/workspace"} articlesPerPage={pagination.pageSize} totalPages={pagination.total} path={"/"} lng={lng} />}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

