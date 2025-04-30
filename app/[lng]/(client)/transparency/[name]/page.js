"use client"
import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/app/i18n/client';
import Link from 'next/link';

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
                        <div className="font-bold text-2xl">{categoryTitle}</div>
                    </div>
                    <div className="__card_groups">
                        {loading ? (
                            <div className="loading">Уншиж байна...</div>
                        ) : items.length > 0 ? (
                            items.map((item, index) => (
                                <div key={index}
                                onClick={() => {
                                    const url = `/transparency/${name}/${item.id}?title=${encodeURIComponent(item.title)}&description=${encodeURIComponent(item.description)}&file_path=${encodeURIComponent(item.file_path)}`;
                                    window.open(url, '_blank');
                                  }}
                                  
                                  
                                    target="_blank"
                                    className="__card"
                                    style={{ background: 'var(--surface-bk2)' }}>
                                    <div className="__category_group">
                                        <h3>{item.title}</h3>
                                    </div>
                                    <div className="circle">
                                        <i className="pi pi-arrow-right"></i>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no_data">
                                Мэдээлэл олдсонгүй
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 