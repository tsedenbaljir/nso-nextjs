import React from 'react';
import Image from 'next/image';
import { useRouter } from "next/navigation";

export default function index(product) {
    const router = useRouter();

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/images/default.jpg';
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/uploads/')) return imagePath;
        return `https://downloads.1212.mn/${imagePath}`;
    };
    
    return (
        <div key={product.id}
            className="__posts cursor-pointer pr-2"
            onClick={() => {
                router.push("/news/" + product.id);
            }}
        >
            <div className="relative w-full h-[200px]">
                <Image
                    src={getImageUrl(product.header_image)}
                    alt={product.name || 'News image'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover rounded-lg"
                    priority={false}
                    quality={75}
                />
            </div>
            <div className="__title overflow-hidden">
                <div className="line-clamp-2">
                    {product.name}
                </div>
            </div>
            <div className="__view_comments">
                <div className="__info">
                    <div style={{ marginLeft: 20 }}>
                        <i className="pi pi-calendar-minus"></i>
                        {product.created_date.substr(0, 10)}
                    </div>
                </div>
            </div>
        </div>
    );
}
