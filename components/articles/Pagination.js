import React from 'react';
export default function Index({ page, totalPages, path, lng }) {
    const last = 5;
    const totalPage = Math.ceil(totalPages / 12)
    return (
        <>
            <div className="nso_pagination">
                <ul>
                    <li>
                        <a href={`/${lng}/news/${path}`}>{"<< Эхэнд"}</a>
                    </li>
                    {page > last &&
                        <li>
                            <i>...</i>
                        </li>
                    }
                    {Array.from({ length: page + last > totalPage ? totalPage : page + last }, (_, index) => {
                        return (
                            <li key={index}>
                                {index + 1 === parseInt(page) ? (
                                    <span>{index + 1}</span>
                                ) : (
                                    <a href={`/${lng}/news/${path}?page=${index + 1}`}>{index + 1}</a>
                                )}
                            </li>
                        );
                    }).slice(page > last ? page - 3 : 0, page > last ? page + 2 : page + last)}
                    {page + last < totalPage &&
                        <li>
                            <i>...</i>
                        </li>
                    }
                    <li>
                        <a href={`/${lng}/news/${path}?page=${totalPage}`}>{"Сүүлд >>"}</a>
                    </li>
                </ul>
            </div>
        </>
    );
}
