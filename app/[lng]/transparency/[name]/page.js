"use client"
import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/app/i18n/client';
import Layout from '@/components/baseLayout';
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

    // Helper function to format date
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('mn-MN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    };

    return (
        <Layout lng={lng}>
            <div className="nso_transparency mt-40">
                <div className="nso_container">
                    <div className="w-full">
                        <div className="transparency_header text-left">
                            <h1>{categoryTitle}</h1>
                        </div>
                        <div className="transparency_list">
                            {loading ? (
                                <div className="loading">Уншиж байна...</div>
                            ) : items.length > 0 ? (
                                items.map((item, index) => (
                                    <div key={item.id} className="transparency_item">
                                        <div className="item_content">
                                            <h3>{item.title}</h3>
                                            {item.description && (
                                                <p>{item.description}</p>
                                            )}
                                            {item.file_path && (
                                                <a
                                                    href={item.file_path}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="download_link"
                                                >
                                                    <i className="pi pi-file-pdf"></i>
                                                    <span>PDF татах</span>
                                                </a>
                                            )}
                                        </div>
                                        <div className="item_meta">
                                            <span className="date">
                                                {formatDate(item.created_date)}
                                            </span>
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
        </Layout>
    );
} 