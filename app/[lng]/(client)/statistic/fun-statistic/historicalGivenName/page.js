"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getHistoricalNames } from "@/app/services/fun-statistic";

export default function HistoricalGivenName() {
    const [historicalNames, setHistoricalNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchHistoricalNamesData() {
        try {
            const data = await getHistoricalNames();
            if (data.success) {
                setHistoricalNames(data.names);
            } else {
                setError(data.error || "Өгөгдөл татахад алдаа гарлаа");
            }
        } catch (err) {
            console.error("Error fetching historical names:", err);
            setError(err.message || "Өгөгдөл татахад алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchHistoricalNamesData();
    }, []);

    if (loading) {
        return (
            <div className="nso_container">
                <div className="text-center py-12">
                    <p className="text-gray-600">Уншиж байна...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="nso_container">
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Link
                        href="/mn/statistic/fun-statistic/home"
                        className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Буцах
                    </Link>
                </div>
            </div>
        );
    }

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=https://www.1212.mn/mn/statistic/fun-statistic/historicalGivenName`;

    return (
        <div className="nso_container">
            <div id="historicalname" className="py-8 text-center">
                <h1 className="text-[32px] md:text-[48px] lg:text-[56px] font-bold text-center mb-5 md:mb-8 lg:mb-10" style={{
                    fontFamily: 'Georgia, serif',
                    textShadow: '2px 2px #ffffff'
                }}>
                    Түүхэн нэртэй хүмүүсийн тоо
                </h1>

                <div className="grid grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-8">
                    {historicalNames.slice(0, 20).map((person) => (
                        <Link
                            key={person.givenName}
                            href={`/mn/statistic/fun-statistic/family-name?search=${encodeURIComponent(person.givenName)}`}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="image-container relative mb-3 overflow-hidden rounded-lg shadow-lg w-full h-[130px] md:h-[180px] lg:h-[200px]" style={{
                                boxShadow: '0 10px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'
                            }}>
                                <img
                                    src={`/images/sonirkholtoi/Peoples/${person.imageUrl}`}
                                    alt={person.givenName}
                                    className="border border-gray-300 rounded-[5px] w-full h-[130px] md:h-[180px] lg:h-[200px] object-cover grayscale-[70%] group-hover:grayscale-0 transition-all duration-300 ease-in-out"
                                    onError={(e) => {
                                        e.currentTarget.src = '/images/sonirkholtoi/default_1200x630.jpg';
                                        e.currentTarget.classList.remove('grayscale-[70%]');
                                        e.currentTarget.classList.add('grayscale-0');
                                    }}
                                />
                            </div>

                            <span className="name font-bold text-[22px] md:text-[30px] lg:text-[35px] mt-2.5 w-full block text-center" style={{
                                fontFamily: 'Georgia, serif'
                            }}>
                                {person.givenName}
                            </span>

                            <span className="count font-bold text-gray-700 text-[24px] md:text-[32px] lg:text-[45px] leading-5 md:leading-[22px] lg:leading-10 mb-5 w-full block text-center" style={{
                                fontFamily: 'Georgia, serif'
                            }}>
                                {person.population.toLocaleString('mn-MN')}
                            </span>
                        </Link>
                    ))}
                </div>

                {/* Facebook Share Button */}
                <div className="flex justify-end mt-8 mb-4">
                    <a
                        href={facebookShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Хуваалцах
                    </a>
                </div>
            </div>
        </div>
    );
}
