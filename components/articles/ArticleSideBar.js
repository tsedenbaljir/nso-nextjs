import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import Image from 'next/image';

export default function ArticleSideBar({ article }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/images/default.jpg'; // Fallback image
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/uploads/')) return imagePath;
        return `https://downloads.1212.mn/${imagePath}`;
    };

    return (
        <div className="__sidebar">
            <div className="__header">
                <div className="__title">
                    ШИНЭ МЭДЭЭ
                </div>
            </div>
            {
                article.slice(0, 6).map((art) => {
                    return <div className="__post cursor-pointer"
                        onClick={() => {
                            router.push("/news/" + art.id);
                        }}>
                        <a className="__posts">
                            <div className="relative w-full h-[200px]">
                                <Image
                                    className="object-cover rounded-lg"
                                    src={getImageUrl(art.header_image)}
                                    alt={art.name || 'News image'}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    priority={false}
                                    quality={75}
                                />
                            </div>
                            <div className="__title overflow-hidden">
                                <div className="line-clamp-3">
                                    {art.name}
                                </div>
                            </div>
                            <div className='__view_comments'>
                                <div className=" __info">
                                    <i className="pi pi-calendar-minus"></i>
                                    {art.created_date.substr(0, 10)}
                                </div>
                            </div>
                        </a>
                    </div>
                })
            }
        </div>
    );
}
