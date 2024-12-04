import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import TextLoading from '@/components/Loading/Text/Index';

export default function Index({ Articles, loading, mainPath }) {
    const router = useRouter();
    const [errorImages, setErrorImages] = useState({});

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/images/default.jpg';
        return `https://downloads.1212.mn/${imagePath}`;
    };

    const handleImageError = (articleId, imagePath) => {
        setErrorImages(prev => ({
            ...prev,
            [articleId]: `/uploads/${imagePath}`
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
                                        <div className="relative w-full h-[200px]">
                                            <Image
                                                src={errorImages[art.id] || getImageUrl(art.header_image)}
                                                alt={art.name || 'Article image'}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover rounded-lg"
                                                priority={false}
                                                quality={75}
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
