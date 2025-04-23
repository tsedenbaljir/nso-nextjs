"use client";
import { useEffect, useState } from "react";
import Tr from '@/components/dissemination/Tr';
import Main from '@/components/dissemination/Main';
import { useTranslation } from '@/app/i18n/client';
import Text from '@/components/Loading/Text/Index';
import "@/components/styles/dissemination-list.scss";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from '@/components/dissemination/Pagination';

export default function AboutUs({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");
    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get('page') || 1, 10);

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const articlesPerPage = 10;

    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        if (value.length > 3 || value.length === 0) {
            fetchArticles(value);
        }
    };

    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
    };

    const fetchArticles = async (value) => {
        setLoading(false);
        try {
            const response = await fetch(`/api/dissemination?page=${page}&pageSize=${articlesPerPage}&lng=${lng}&type=future&searchTerm=${value || ""}`, {
                ...requestOptions,
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.status) {
                setArticles(result.data);
                setTotalPages(result.totalPage);
            }
            setLoading(true);
        } catch (error) {
            console.error('Error fetching articles:', error);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [page, articlesPerPage, lng]);

    return (
        <>
            <div className="__main_search">
                <span className="__search" style={{ border: "2px solid #005baa" }}>
                    <input
                        className="p-autocomplete-input p-inputtext p-component"
                        placeholder={t("download.search")}
                        value={searchTerm}
                        style={{ border: "0" }}
                        onChange={handleSearchChange}
                    />
                    <button
                        className="p-autocomplete-dropdown p-ripple p-button p-component p-button-icon-only"
                        // onClick={handleSearchClick}
                        style={{
                            width: 80,
                            borderRadius: 0,
                            border: 0,
                            background: "var(--surface-c)"
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </button>
                </span>
            </div>
            <img src="/images/disimg.jpg" width="100%" />
            <Main type="future" lng={lng}>
                <table className="w-full">
                    <thead className=".p-datatable-new-thead">
                        <tr className="__mobile_table">
                            <th style={{ width: "15%" }}>{t('dissemination.scope')}</th>
                            <th style={{ width: "60%" }}>{t('dissemination.specifications')}</th>
                            <th style={{ width: "15%" }}>{t('dissemination.dateDistribution')}</th>
                            <th style={{ width: "10%" }}>{t('dissemination.time')}</th>
                        </tr>
                    </thead>
                    <tbody className="p-datatable-tbody">
                        {loading ? (
                            articles.map((dt, index) => (
                                <Tr key={index} index={index} item={dt} lng={lng} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">
                                    <Text />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="__pagination">
                    <span>
                        {lng === "mn" ? "Нийт: " : "A total of: "}
                        <strong>{totalPages}</strong>
                        {lng === "mn" ? " илэрцээс 10" : " Showing: 10"}
                        {lng === "mn" ? " илэрц үзүүлж байна." : "."}
                        {/* <span className="__pagination_text">
                            *{lng === "mn" ? 'Тухайн цаг үеийн байдлаас шалтгаалж тархаах өдөр цагт өөрчлөлт орно.' : 'Depending on the situation at the time, the day and time of distribution will vary.'}
                        </span> */}
                    </span>
                    <div className="mt-2">
                        <Pagination page={page} totalPages={totalPages} mainPath="dissemination" path="future" lng={lng} articlesPerPage={articlesPerPage} />
                    </div>
                </div>
            </Main>
        </>
    );
}
