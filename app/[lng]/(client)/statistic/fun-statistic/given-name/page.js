
"use client";

import { useEffect, useMemo, useState } from "react";
import Loading from "@/app/[lng]/(client)/loading";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getGivenNameStatistic } from "@/app/services/fun-statistic";

export default function GivenNameStatistic() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchQuery = (searchParams.get("search") || "").trim();

    const [search, setSearch] = useState(searchQuery);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mode, setMode] = useState("summary"); // summary | detail
    const [longNames, setLongNames] = useState([]);
    const [commonNames, setCommonNames] = useState([]);
    const [detailData, setDetailData] = useState(null);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const currentQuery = (searchParams.get("search") || "").trim();
        setSearch(currentQuery);
        fetchGivenNames(currentQuery);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.toString()]);

    async function fetchGivenNames(query) {
        setLoading(true);
        setError("");
        setDetailData(null);

        try {
            const data = await getGivenNameStatistic(query || "");

            if (!data.success) {
                setError(data.error || "Өгөгдөл татахад алдаа гарлаа.");
                setMode("summary");
                setLongNames([]);
                setCommonNames([]);
                return;
            }

            if (data.mode === "detail") {
                setMode("detail");
                setDetailData(data);
            } else {
                setMode("summary");
                setLongNames(data.longNames || []);
                setCommonNames(data.commonNames || []);
            }
        } catch (err) {
            console.error("Given name page error:", err);
            setError(err.message || "Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim().length < 2) {
            setStatus("Нэр дор хаяж 2 үсэгтэй байх ёстой.");
            return;
        }
        router.replace(`${pathname}?search=${encodeURIComponent(search.trim())}`, { scroll: false });
    };

    const resetToSummary = () => {
        router.replace(pathname, { scroll: false });
    };

    const longNameRows = useMemo(
        () =>
            longNames.map((item) => (
                <tr key={item.rowNo || item.name}>
                    <td className="text-center px-3 py-3 border-b border-gray-200 font-semibold">{item.rowNo}</td>
                    <td className="text-center px-3 py-3 border-b border-gray-200">{item.name}</td>
                    <td className="text-center px-3 py-3 border-b border-gray-200">{item.length}</td>
                </tr>
            )),
        [longNames]
    );

    const commonNameRows = useMemo(
        () =>
            commonNames.map((item) => (
                <tr key={item.rowNo || item.name}>
                    <td className="text-center px-3 py-3 border-b border-gray-200 font-semibold">{item.rowNo}</td>
                    <td className="text-center px-3 py-3 border-b border-gray-200">
                        <button
                            type="button"
                            className="text-blue-600 hover:underline"
                            onClick={() =>
                                router.replace(`${pathname}?search=${encodeURIComponent(item.name)}`, { scroll: false })
                            }
                        >
                            {item.name}
                        </button>
                    </td>
                    <td className="text-center px-3 py-3 border-b border-gray-200">
                        {item.population.toLocaleString("mn-MN")}
                    </td>
                </tr>
            )),
        [commonNames, pathname, router]
    );

    const detailRows = useMemo(
        () =>
            detailData?.series?.filter(row => row.year >= 2010 && row.year <= new Date().getFullYear())?.map((row) => (
                <tr key={`${row.year}-${row.rowNo}`}>
                    <td className="text-center px-3 py-3 border-b border-gray-200 font-semibold">{row.rowNo}</td>
                    <td className="text-center px-3 py-3 border-b border-gray-200">{row.year}</td>
                    <td className="text-center px-3 py-3 border-b border-gray-200">
                        {row.population.toLocaleString("mn-MN")}
                    </td>
                </tr>
            )),
        [detailData]
    );

    return (
        <div className="nso_container">
            <div className="nso_statistic_section bg-white magazines px-4 py-8 w-full">
                <div className="space-y-8 w-full">
                    <section className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold">Тантай ижил нэрийн статистик</h1>
                        <p className="text-gray-600 max-w-4xl mx-auto">
                            Хүн ам, өрхийн мэдээллийн сан дахь хамгийн урт нэр, түгээмэл нэр болон өөрийн нэрийн түүхэн
                            тархалтыг шалгана уу. Доорх хайлтаар нэрээ оруулан жил бүрийн бүртгэлтэй тоог үзнэ.
                        </p>
                    </section>

                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col md:flex-row items-center gap-3 md:gap-4"
                    >
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value.toUpperCase())}
                            placeholder="Нэрээ оруулна уу (жишээ: ТЭМҮҮЖИН)"
                            className="w-full md:flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                        />
                        <button
                            type="submit"
                            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            disabled={loading}
                        >
                            {loading ? "Тооцож байна..." : "Хайх"}
                        </button>
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={resetToSummary}
                                className="w-full md:w-auto px-6 py-3 border border-gray-400 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Ерөнхий жагсаалт
                            </button>
                        )}
                    </form>

                    {status && (
                        <div className="text-center text-sm text-orange-500">{status}</div>
                    )}

                    {loading && <Loading />}

                    {!loading && error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    {!loading && !error && mode === "summary" && (
                        <>
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">Монгол Улсын хамгийн урт нэр</h2>
                                <div className="overflow-x-auto w-full">
                                    <table className="min-w-full text-sm md:text-base border border-gray-200 rounded-lg bg-white shadow-sm">
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 uppercase text-xs tracking-wide">
                                            <tr>
                                                <th className="px-3 py-3 text-center border-b border-gray-200">№</th>
                                                <th className="px-3 py-3 text-center border-b border-gray-200">Нэр</th>
                                                <th className="px-3 py-3 text-center border-b border-gray-200">Үсгийн тоо</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">{longNameRows}</tbody>
                                    </table>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">Хамгийн түгээмэл нэр</h2>
                                <div className="overflow-x-auto w-full">
                                    <table className="min-w-full text-sm md:text-base border border-gray-200 rounded-lg bg-white shadow-sm">
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 uppercase text-xs tracking-wide">
                                            <tr>
                                                <th className="px-3 py-3 text-center border-b border-gray-200">№</th>
                                                <th className="px-3 py-3 text-center border-b border-gray-200">Нэр</th>
                                                <th className="px-3 py-3 text-center border-b border-gray-200">Тоо</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">{commonNameRows}</tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    )}

                    {!loading && !error && mode === "detail" && detailData && (
                        <section className="space-y-4">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-semibold uppercase tracking-wide">
                                    {detailData.name}
                                </h2>
                                <p className="text-gray-700">
                                    Нийт бүртгэлтэй иргэдийн тоо:{" "}
                                    <span className="font-bold">
                                        {(detailData.totalPopulation || 0).toLocaleString("mn-MN")}
                                    </span>
                                </p>
                            </div>

                            <div className="overflow-x-auto w-full">
                                <table className="min-w-full text-sm md:text-base border border-gray-200 rounded-lg bg-white shadow-sm">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 uppercase text-xs tracking-wide">
                                        <tr>
                                            <th className="px-3 py-3 text-center border-b border-gray-200">№</th>
                                            <th className="px-3 py-3 text-center border-b border-gray-200">Он</th>
                                            <th className="px-3 py-3 text-center border-b border-gray-200">Бүртгэгдсэн тоо</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">{detailRows}</tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
