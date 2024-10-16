
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { useRouter } from "next/navigation";
import { Carousel } from 'primereact/carousel';
import { Tag } from 'primereact/tag';

export default function CarouselNews() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const myHeaders = new Headers();
    myHeaders.append(
        "Authorization",
        "Bearer " + process.env.BACKEND_KEY
    );

    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
    };

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch(`${process.env.BACKEND_URL}/api/articles?populate=cover&populate=category&populate=language`, requestOptions);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const articles = await response.json();
                setProducts(articles.data);
                setLoading(true);
            } catch (error) {
                console.error('Error fetching articles:', error);
            }
        };

        fetchArticles();
    }, []);

    const responsiveOptions = [
        {
            breakpoint: '1400px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '1199px',
            numVisible: 3,
            numScroll: 1
        },
        {
            breakpoint: '767px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '575px',
            numVisible: 1,
            numScroll: 1
        }
    ];

    const getSeverity = (product) => {
        switch (product) {
            case 'INSTOCK':
                return 'success';

            case 'LOWSTOCK':
                return 'warning';

            case 'OUTOFSTOCK':
                return 'danger';

            default:
                return null;
        }
    };

    const productTemplate = (product) => {
        return (
            <div
                className="__posts cursor-pointer"
                onClick={() => {
                    router.push("/news/" + product.documentId);
                }}
            >
                <img
                    className="__image"
                    src={process.env.BACKEND_URL + product.cover.formats.thumbnail.url}
                />
                <div className="__title overflow-hidden">
                    <div className="line-clamp-3">
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
    };

    return (
        <div className="nso_about_us">
            <div className="nso_container">
                <div className="__about_post">
                    <div className="__header">
                        <div className="__title">
                            ШИНЭ МЭДЭЭ
                        </div>
                    </div>
                    <div className="__post">
                        <div className="_group_list">
                            {loading && <Carousel
                                value={products}
                                numVisible={4}
                                numScroll={4}
                                autoplayInterval={10000}
                                showNavigators={false}
                                responsiveOptions={responsiveOptions}
                                itemTemplate={productTemplate}
                            />}
                            <div
                                className="__action_area"
                            >
                                <button className="nso_btn success">Дэлгэрэнгүй</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
