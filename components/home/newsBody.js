"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from "next/navigation";

export default function index(product) {
    const router = useRouter();

    const [imageError, setImageError] = useState(false);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '/images/default.jpg';
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/uploads/')) return imagePath;
        return `https://downloads.1212.mn/${imagePath}`;
    };

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div key={product.id}
            className="__posts cursor-pointer pr-2"
            onClick={() => {
                router.push("/about-us/news/" + product.id);
            }}
        >
            <div className="relative w-full h-[200px] overflow-hidden">
                <img
                    src={imageError ? `/uploads/${product.header_image}` : getImageUrl(product.header_image)}
                    alt={product.name || 'News image'}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                    onError={handleImageError}
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
