
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import newsBody from './newsBody';
import { Carousel } from 'primereact/carousel';
import Text from '@/components/Loading/Text/Index';

export default function CarouselMedia() {
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
                const response = await fetch(`${process.env.BACKEND_URL}/api/articles?populate=cover&populate=category&populate=language`, {
                    ...requestOptions,
                    cache: 'no-store',
                });

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

    return (
        <div className="nso_about_us">
            <div className="nso_container">
                <div className="__about_post">
                    <div className="__header">
                        <div className="__title">
                            МЕДИА МЭДЭЭ
                        </div>
                    </div>
                    <div className="__post">
                        <div className="_group_list">
                            {loading ? <Carousel
                                value={products}
                                numVisible={4}
                                numScroll={4}
                                autoplayInterval={10000}
                                showNavigators={false}
                                responsiveOptions={responsiveOptions}
                                itemTemplate={newsBody}
                            /> : <Text />}
                            <Link href="/news/latest"
                                className="__action_area"
                            >
                                <button className="nso_btn success">Дэлгэрэнгүй</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
