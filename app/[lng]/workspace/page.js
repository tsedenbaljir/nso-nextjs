"use client"
import React, { useState, useEffect } from 'react';
import Layout from '@/components/baseLayout';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/components/articles/Pagination';
import { useTranslation } from '@/app/i18n/client';
import { useRouter } from "next/navigation";
import '@/components/styles/laws.scss';

export default function Home({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");
    const router = useRouter();

    const searchParams = useSearchParams();
    const page = searchParams.get('page') || 0;

    // States
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    const articlesPerPage = 5;

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
    ]

    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow'
    };

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/job-postings?page=${page}&pageSize=${articlesPerPage}&lng=${lng}`, {
                ...requestOptions,
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const res = await response.json();

            setList(res.data);
            setTotalPages(res.pagination.total);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching articles:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    return (
        <Layout lng={lng}>
            <div className="nso_about_us mt-40">
                <div className="nso_container">
                    <div className="__header flex flex-wrap w-full my-16 mb-8 items-center justify-between text-main">
                        <div className="__title text-2xl font-semibold uppercase">
                            {lng === "mn" ? "Нээлттэй ажлын байр" : "OPEN JOB VACANCY"}
                        </div>
                        <div className="__jf flex items-center">
                            <div className="__jobs-count float-right mr-5">
                                {lng === "mn" ? "Нийт" : "A total of"}
                                <strong>{" " + 10}</strong> {lng === "mn" ? "ажлын байр" : "jobs"}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="nso_container">
                    <div className="nso_tab_content">
                        <div className="__table">
                            {
                                list.map((dt, index) => {
                                    return <div onClick={() => {
                                        router.push(`/workspace/${dt.id}`);
                                    }} key={index} className="ws_body mt-2 text-main border-b-2 border-dotted border-gray-400 cursor-pointer">
                                        <div className="ws_title text-2xl font-semibold hover:text-blue-300">{dt.name}</div>
                                        <div
                                            className="ws_desc my-4 text-base"
                                            dangerouslySetInnerHTML={{
                                                __html: dt.body.length > 300 ? dt.body.substr(0, 300) + '...' : dt.body
                                            }}
                                        ></div>
                                        <ul className='flex'>
                                            <li className="ws_desc my-4 text-base">{dt.createdDate.substr(0, 10)}</li>
                                            <li className="ws_desc my-4 text-base ml-10">
                                                {
                                                    lng === "mn" ? location.filter(item => item.code === dt.location)[0].namemn : location.filter(item => item.code === dt.location)[0].nameen
                                                }
                                            </li>
                                        </ul>
                                    </div>
                                })
                            }
                            <div className="nso_container mt-5 mb-5">
                                <Pagination page={parseInt(page)} mainPath={"workspace"} articlesPerPage={articlesPerPage} totalPages={totalPages} path={"/"} lng={lng} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout >
    );
}
