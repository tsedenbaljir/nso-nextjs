"use client"
import React, { useState, useEffect, use } from 'react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Text from '@/components/Loading/Text/Index';
import ReactMarkdown from 'react-markdown';
import Layout from '@/components/baseLayout';
import ContactSourceCard from '@/components/contact/ContactSourceCard';
import { useTranslation } from '@/app/i18n/client';
import '@/components/styles/contact-us.scss';
import './works.scss';

export default function WorkspaceDetail(props) {
    const {
        id,
        lng
    } = use(props.params);

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
            <div className="nso_container workspace_detail_layout">
                <div className="__info_detail_page">
                    {!loading ? (
                        <div className="w-full my-16 mb-8 text-main">
                            <div className="text-2xl font-bold workspace_detail_title">
                                {data.name}
                            </div>
                            <div className="ws_desc">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw]}
                                >
                                    {data.body}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Text />
                            <Text />
                        </>
                    )}
                </div>
                
                <div className="r_side">
                    <div className="r_side_panel">
                        <div className="workspace_registration">
                            <h2 className="uppercase text-xl font-bold">
                                {t('Registration')}
                            </h2>
                            <p>Засгийн газрын III байр, Үндэсний Статистикийн хорооны байр, Бага тойруу -44, Улаанбаатар -11, Монгол Улс</p>
                        </div>
                        <p className="workspace_info_text">
                            Таны мэдээлэл манай байгууллагын хүний нөөцийн мэдээллийн санд бүртгэгдэнэ. Байгууллагаас сул орон гарсан тохиолдолд Төрийн албаны тухай хууль болон холбогдох журмын дагуу шаардлага хангасан иргэнийг сонгон шалгаруулж томилох юм.
                        </p>
                        <ContactSourceCard lng={lng} sourceKey="contactSource" />
                    </div>
                </div>
            </div>
        </>
    );
}
