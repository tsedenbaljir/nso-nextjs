import React from 'react';
import { useRouter } from "next/navigation";

export default function index(product) {
    const router = useRouter();
    return (
        <div key={product.id}
            className="__posts cursor-pointer"
            onClick={() => {
                router.push("/news/" + product.documentId);
            }}
        >
            {product.cover && <img
                className="__image"
                src={process.env.BACKEND_URL + product.cover.formats.thumbnail.url}
            />}
            <div className="__title overflow-hidden">
                <div className="line-clamp-2">
                    {product.title}
                </div>
            </div>
            <div className="__view_comments">
                <div className="__info">
                    <div style={{ marginLeft: 20 }}>
                        <i className="pi pi-calendar-minus"></i>
                        {product.createdAt.substr(0, 10)}
                    </div>
                    {/* <span className="__view">
                            234
                            <div style={{ marginLeft: 20 }}>
                                <i className="pi pi-calendar-minus"></i>
                                2024-05-26
                            </div>
                      </span> */}
                </div>
            </div>
        </div>
    );
}
