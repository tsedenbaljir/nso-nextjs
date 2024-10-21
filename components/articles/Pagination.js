import React from 'react';

export default function Index({ page, totalPages, path }) {
    const dots = 3;
    return (
        <>
            <div className="nso_pagination">
                <ul>
                    {page > dots && (
                        <li>
                            <a href={`/mn/news/${path}`}>{"<< Эхэнд"}</a>
                        </li>
                    )}
                    {Array.from({ length: totalPages }, (_, index) => {
                        if (index === page - dots - 1 || index === page + dots) {
                            return (
                                <li key={index}>
                                    <i>...</i>
                                </li>
                            );
                        }
                        return (
                            <li key={index}>
                                {index + 1 === parseInt(page) ? (
                                    <span>{index + 1}</span>
                                ) : (
                                    <a href={`/mn/news/${path}?page=${index + 1}`}>{index + 1}</a>
                                )}
                            </li>
                        );
                    })}
                    {page + dots < totalPages && (
                        <li>
                            <a href={`/mn/news/${path}?page=${totalPages}`}>{"Сүүлд >>"}</a>
                        </li>
                    )}
                </ul>
            </div>
        </>
    );
}
