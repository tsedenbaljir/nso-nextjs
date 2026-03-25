"use client"
import React, { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Text from '@/components/Loading/Text/Index';
import ReactMarkdown from 'react-markdown';
import Layout from '@/components/baseLayout';
import { useTranslation } from '@/app/i18n/client';
import './works.scss';

export default function WorkspaceDetail({ params: { id, lng } }) {
    const { t } = useTranslation(lng, "lng", "");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/workspace/${id}?language=${lng}`);
            if (!response.ok) throw new Error('Failed to fetch');

            const result = await response.json();
            if (result.status) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching job posting:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!data && !loading) {
        return (
            <>
                <div className="nso_container">
                    <div className="text-center text-xl">
                        {lng === "mn" ? "Мэдээлэл олдсонгүй" : "Information not found"}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="nso_container">
                <div className="__info_detail_page">
                    {!loading ? <div className="w-full my-16 mb-8 items-center justify-between text-main">
                        <div className="text-2xl font-bold __header">
                            {data.name}
                        </div>
                        <div
                            className="ws_desc"
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                            >
                                {data.body}
                            </ReactMarkdown>
                        </div>
                    </div> : <>
                        <Text />
                        <Text />
                    </>}
                </div>
                <div className="r_side">
                    <div className="right_side_top">
                        <h2 className='uppercase text-xl font-bold'>{t('Phone')}</h2>
                        <p>51-261530</p>
                        <br />
                        <h2 className='uppercase text-xl font-bold'>
                            {t('Registration')}
                        </h2>
                        <p>Засгийн газрын III байр, Үндэсний Статистикийн хорооны байр, Бага тойруу -44, Улаанбаатар -11, Монгол Улс</p>
                    </div>
                    <div className="right_side_bottom">
                        <p>Таны мэдээлэл манай байгууллагын хүний нөөцийн мэдээллийн санд бүртгэгдэнэ. Байгууллагаас сул орон гарсан тохиолдолд Төрийн албаны тухай хууль болон холбогдох журмын дагуу шаардлага хангасан иргэнийг сонгон шалгаруулж томилох юм.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
