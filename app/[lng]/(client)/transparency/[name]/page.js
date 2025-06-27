"use client"
import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/app/i18n/client';
import Link from 'next/link';
import TextLoading from '@/components/Loading/Text/Index';

export default function TransparencyCategory({ params: { lng, name } }) {
    const { t } = useTranslation(lng, "lng", "");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryTitle, setCategoryTitle] = useState('');

    useEffect(() => {
        setCategoryTitle(decodeURIComponent(name));
        fetchItems();
    }, [name]);

    const fetchItems = async () => {
        try {
            const decodedName = decodeURIComponent(name);
            const response = await fetch(`/api/transparency?category=${decodedName}&lng=${lng}`);
            const result = await response.json();
            if (result.status) {
                setItems(result.data);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="nso_statistic_category" style={{ background: 'white' }}>
            <div className="nso_container">
                <div className="w-full">
                    <div className="transparency_header">
                        <div className="font-bold text-2xl">
                            {categoryTitle === 'Үйл ажиллагааны ил тод байдал' ? lng === 'mn' ? categoryTitle : 'Operational transparency' :
                                categoryTitle === 'Авлигын эсрэг арга хэмжээ' ? lng === 'mn' ? categoryTitle : 'Anti-corruption measures' :
                                    categoryTitle === 'Үйл ажиллагааны хөтөлбөр, тайлан' ? lng === 'mn' ? categoryTitle : 'Action programs and reports' :
                                        categoryTitle === 'Төрийн албаны зөвлөлийн Үндэсний статистикийн хорооны дэргэдэх салбар зөвлөл' ?
                                            lng === 'mn' ? categoryTitle : 'Branch Council under the Statistics Committee of the National Council of Public Service'
                                            : categoryTitle}
                        </div>
                    </div>
                    <div className="__card_groups">
                        {loading ? (
                            <TextLoading />
                        ) : items.length > 0 ? (
                            items.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.id === 38 ? `/${lng}/contact`
                                        : item.id === 37 ? `/${lng}/transparency/tran-news`
                                            : `/${lng}/transparency/${name}/${item.id}`}
                                    className="__card"
                                    style={{ background: 'var(--surface-bk2)' }}
                                >
                                    <div className="__category_group">
                                        <h3>{item.title}</h3>
                                    </div>
                                    <div className="circle">
                                        <i className="pi pi-arrow-right"></i>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="no_data p-5">
                                {lng === 'mn' ? 'Мэдээлэл олдсонгүй' : 'No data found'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 