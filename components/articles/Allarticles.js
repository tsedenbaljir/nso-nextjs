"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import TextLoading from '@/components/Loading/Text/Index';

export default function Index({ Articles, loading, mainPath }) {
    const router = useRouter();
    const [errorImages, setErrorImages] = useState({});

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/images/default.jpg';
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/uploads/')) return imagePath;
        return `/uploads/images/${imagePath}`;
    };

    const handleImageError = (articleId, imagePath) => {
        setErrorImages(prev => ({
            ...prev,
            [articleId]: `/uploads/images/${imagePath}`
        }));
    };

    return (
        <>
            <div className="__post_all">
                <div className="_group_list_all">
                    {loading ? (
                        <div className='w-screen'>
                            <TextLoading />
                            <br />
                            <TextLoading />
                            <br />
                            <TextLoading />
                            <br />
                            <TextLoading />
                            <br />
                            <TextLoading />
                        </div>
                    ) : (
                        Articles.length > 0 ? (
                            Articles.map((art, index) => (
                                <div className="__list" key={index}>
                                    <div className="__posts"
                                        onClick={() => {
                                            router.push(`/${mainPath !== "transparency" ? mainPath : 'transparency/tender'}/${art.id}`);
                                        }}
                                    >
                                        <div className="relative w-full h-[200px] overflow-hidden">
                                            <Image
                                                src={errorImages[art.id] || getImageUrl(art.header_image)}
                                                alt={art.name || 'Article image'}
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="absolute inset-0 w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                                                onError={() => handleImageError(art.id, art.header_image)}
                                            />
                                        </div>
                                        <div className="__title overflow-hidden">
                                            <div className="line-clamp-2">
                                                {art.name}
                                            </div>
                                        </div>
                                        <div className="__view_comments">
                                            <div className="__info">
                                                <i className="pi pi-calendar-minus"></i>
                                                {art.created_date.substr(0, 10)}
                                            </div>
                                        </div>
                                    </div>
                                    <br />
                                </div>
                            ))
                        ) : (
                            <div>Мэдээлэл олдсонгүй.</div>
                        )
                    )}
                </div>
            </div>
        </>
    );
}
