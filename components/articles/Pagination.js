import React from 'react';
export default function Index({ page, totalPages, mainPath, path, lng, articlesPerPage }) {
    const last = 5;
    const totalPage = Math.ceil(totalPages / articlesPerPage)
    return (
        <>
            <div className="nso_pagination">
                <ul>
                    {totalPage > last && <li>
                        <a href={`/${lng}/${mainPath}/${path}`}>{lng === "mn" ? "<< Эхэнд" : "<< First"}</a>
                    </li>}
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
                                    <a href={`/${lng}/${mainPath}/${path}?page=${index + 1}`}>{index + 1}</a>
                                )}
                            </li>
                        );
                    }).slice(page > last ? page - 3 : 0, page > last ? page + 2 : page + last)}
                    {page + last < totalPage &&
                        <li>
                            <i>...</i>
                        </li>
                    }
                    {totalPage > last && <li>
                        <a href={`/${lng}/${mainPath}/${path}?page=${totalPage}`}>{lng === "mn" ? "Сүүлд >>" : " Last >>"}</a>
                    </li>}
                </ul>
            </div>
        </>
    );
}
