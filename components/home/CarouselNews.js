
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Carousel } from 'primereact/carousel';
import { Tag } from 'primereact/tag';

export default function CarouselNews() {
    const [products, setProducts] = useState([{
        id: '1000',
        code: 'f230fh0g3',
        name: 'Bamboo Watch',
        description: 'Product Description',
        image: 'bamboo-watch.jpg',
        price: 65,
        category: 'Accessories',
        quantity: 24,
        inventoryStatus: 'INSTOCK',
        rating: 5
    },
    {
        id: '1000',
        code: 'f230fh0g3',
        name: 'Bamboo Watch',
        description: 'Product Description',
        image: 'bamboo-watch.jpg',
        price: 65,
        category: 'Accessories',
        quantity: 24,
        inventoryStatus: 'INSTOCK',
        rating: 5
    },
    {
        id: '1000',
        code: 'f230fh0g3',
        name: 'Bamboo Watch',
        description: 'Product Description',
        image: 'bamboo-watch.jpg',
        price: 65,
        category: 'Accessories',
        quantity: 24,
        inventoryStatus: 'INSTOCK',
        rating: 5
    },
    {
        id: '1000',
        code: 'f230fh0g3',
        name: 'Bamboo Watch',
        description: 'Product Description',
        image: 'bamboo-watch.jpg',
        price: 65,
        category: 'Accessories',
        quantity: 24,
        inventoryStatus: 'INSTOCK',
        rating: 5
    },
    {
        id: '1000',
        code: 'f230fh0g3',
        name: 'Bamboo Watch',
        description: 'Product Description',
        image: 'bamboo-watch.jpg',
        price: 65,
        category: 'Accessories',
        quantity: 24,
        inventoryStatus: 'INSTOCK',
        rating: 5
    },
    {
        id: '1000',
        code: 'f230fh0g3',
        name: 'Bamboo Watch',
        description: 'Product Description',
        image: 'bamboo-watch.jpg',
        price: 65,
        category: 'Accessories',
        quantity: 24,
        inventoryStatus: 'INSTOCK',
        rating: 5
    }]);
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
                className="__posts"
            >
                <img
                    className="__image"
                    src="https://downloads.1212.mn/5B05CusPc1Abc8_v1TzBz_gjjrAhMucLHM8iefp2.jpg"
                />
                <div className="__title">
                    <div>
                        БНСУ-ын Статистикийн газартай харилцан туршл...
                    </div>
                </div>
                <div className="__view_comments">
                    <div className="__info">
                        <span className="__view">
                            234
                            <div style={{ marginLeft: 20 }}>
                                <i className="pi pi-calendar-minus"></i>
                                2024-05-26
                            </div>
                        </span>
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
                            <Carousel
                                value={products}
                                numVisible={4}
                                numScroll={4}
                                autoplayInterval={10000}
                                showNavigators={false}
                                responsiveOptions={responsiveOptions}
                                itemTemplate={productTemplate}
                            />
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
