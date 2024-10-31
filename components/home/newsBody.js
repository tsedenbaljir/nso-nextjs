import React from 'react';
import { useRouter } from "next/navigation";

export default function index(product) {
    const router = useRouter();
    return (
        <div key={product.id}
            className="__posts cursor-pointer"
            onClick={() => {
                router.push("/news/" + product.id);
            }}
        >
            <img
                className="__image"
                src={`https://downloads.1212.mn/${product.header_image}`}
                alt="main-news"
            />
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
