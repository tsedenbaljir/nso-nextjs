import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";

export default function ArticleSideBar({ article }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    return (
        <div className="__sidebar">
            <div className="__header">
                <div className="__title">
                    ШИНЭ МЭДЭЭ
                </div>
            </div>
            {
                article.map((art) => {
                    return <div className="__post cursor-pointer"
                        onClick={() => {
                            router.push("/news/" + art.documentId);
                        }}>
                        <a className="__posts">
                            <div className="bg-gray">
                                <img
                                    className="__header_image"
                                    src={process.env.BACKEND_URL + art.cover.formats.large.url}
                                />
                            </div>
                            <div className="__title overflow-hidden">
                                <div className="line-clamp-3">
                                    {art.title}
                                </div>
                            </div>
                            <div className='__view_comments'>
                                <div className=" __info">
                                    <i className="pi pi-calendar-minus"></i>
                                    {art.createdAt.substr(0, 10)}
                                </div>
                            </div>
                        </a>
                    </div>
                })
            }
        </div>
    );
}
