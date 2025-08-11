"use client"
import { useEffect, useState } from 'react';
import Layout from '@/components/baseLayout';
import Link from 'next/link';

export default function Download({ params: { id, file, lng } }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewsAndRedirect = async () => {
            try {
                setLoading(true);

                // Construct the API URL similar to the Angular version
                const apiUrl = `/api/content/download?body=${id}`;

                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-store',
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const sideBarNews = await response.json();

                // Check if we have news data and headerImage
                if (sideBarNews && sideBarNews.data[0].header_image) {
                    // Redirect to the download URL
                    window.location.replace(`https://nso.mn/uploads/images/${sideBarNews.data[0].header_image}`, '_blank');
                    setLoading(false);
                } else {
                    setError('No download file found');
                    setLoading(false);
                }
            } catch (error) {
                setError('Failed to fetch download information');
                setLoading(false);
            }
        };

        fetchNewsAndRedirect();
    }, [id]);

    // Show loading state while fetching data
    if (loading) {
        return (
            <Layout lng={lng}>
                <div className="nso_main_section" style={{ background: 'var(--surface-bk)' }}>
                    <div className="mt-10">
                        <div className="flex items-center justify-center min-h-[200px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-16 w-6 border-b border-blue-600 mx-auto mb-4"></div>
                                <div>Уншиж байна...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // Show error state if something went wrong
    if (error) {
        return (
            <Layout lng={lng}>
                <div className="nso_main_section" style={{ background: 'var(--surface-bk)' }}>
                    <div className="nso_container">
                        <div className="text-center py-8">
                            <div className="text-red-600 mb-4">Алдаа гарлаа</div>
                            <div className="text-gray-600">{error}</div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // This should not be reached if redirect works properly
    return (
        <Layout lng={lng}>
            <div className="nso_main_section" style={{ background: 'var(--surface-bk)' }}>
                <main>
                    <div className="notFoundContainer">
                        <h1 className="title">Файл татах хэсэг</h1>
                        <div className="actions">
                            <Link href={`/mn`} className="homeLink">
                                Нүүр хуудас
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </Layout>
    );
}