import React from 'react';
import Link from 'next/link';
import { Spin } from 'antd';

export default function Result({ showResult, t, loading, data }) {
    if (!showResult) return null;

    const hasResults = data && Object.keys(data).length > 0;

    return (
        <div className="search_result">
            {loading ? (
                <div className="w-full text-center" style={{ paddingTop: "13%" }}>
                    <div className="container">
                        <div className="flex flex-wrap gap-2 justify-center items-center">
                            <Spin />
                        </div>
                    </div>
                    <p className="pb-4">Уншиж байна.</p>
                </div>
            ) : !hasResults ? (
                <div className="group_title">
                    <span className="group_title">{t('menu.empty')}</span>
                </div>
            ) : (
                <>
                    {data.content && data.content.length > 0 && (
                        <div className="result_col">
                            <span className="group_title">Мэдээ мэдээлэл</span>
                            {data.content.map((dt, i) => (
                                <Link
                                    href={`/news/${dt._source.id}`}
                                    key={`content-${dt._source.id}-${i}`}
                                    className="group_item"
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: dt?.highlight?.name || dt._source.name
                                        }}
                                    />
                                </Link>
                            ))}
                        </div>
                    )}
                    {data.download && data.download.length > 0 && (
                        <div className="result_col">
                            <span className="group_title">Тархаах хуваарь</span>
                            {data.download.map((dt, i) => (
                                <Link
                                    href={`/dissemination/${dt._source.id}`}
                                    key={`download-${dt._source.id}-${i}`}
                                    className="group_item"
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: dt?.highlight?.name || dt._source.name
                                        }}
                                    />
                                </Link>
                            ))}
                        </div>
                    )}
                    {data.glossary && data.glossary.length > 0 && (
                        <div className="result_col">
                            <span className="group_title">Мета мэдээлэл</span>
                            {data.glossary.map((dt, i) => (
                                <Link
                                    href={`/glossary/${dt._source.id}`}
                                    key={`glossary-${dt._source.id}-${i}`}
                                    className="group_item"
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: dt?.highlight?.name || dt._source.name
                                        }}
                                    />
                                </Link>
                            ))}
                        </div>
                    )}
                    {data.laws && data.laws.length > 0 && (
                        <div className="result_col">
                            <span className="group_title">Хууль, эрх зүй</span>
                            {data.laws.map((dt, i) => (
                                <Link
                                    href={`/dissemination/${dt._source.id}`}
                                    key={`laws-${dt._source.id}-${i}`}
                                    className="group_item"
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: dt?.highlight?.name || dt._source.name
                                        }}
                                    />
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
