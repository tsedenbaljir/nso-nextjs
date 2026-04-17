"use client";

import { useEffect, useMemo, useState } from "react";
import Loading from "@/app/[lng]/(client)/loading";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getFamilyNameStatistic } from "@/app/services/fun-statistic";

export default function FamilyNameStatistic() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchQuery = (searchParams.get("search") || "").trim();

    const [search, setSearch] = useState(searchQuery);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mode, setMode] = useState("top"); // top | aimag
    const [topFamilies, setTopFamilies] = useState([]);
    const [aimagData, setAimagData] = useState(null);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const currentQuery = (searchParams.get("search") || "").trim();
        setSearch(currentQuery);
        fetchFamilies(currentQuery);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.toString()]);

    const resetToTop = () => {
        router.replace(pathname, { scroll: false });
    };

    async function fetchFamilies(query) {
        setLoading(true);
        setError("");
        setStatus("");
        setAimagData(null);

        try {
            const data = await getFamilyNameStatistic(query || "");

            if (!data.success) {
                setError(data.error || "Өгөгдөл татахад алдаа гарлаа.");
                setMode("top");
                setTopFamilies([]);
                return;
            }

            if (data.mode === "aimag") {
                setMode("aimag");
                setAimagData({
                    familyName: data.familyName,
                    total: data.total,
                    regions: data.regions || [],
                });
            } else {
                setMode("top");
                setTopFamilies(data.families || []);
            }
        } catch (err) {
            console.error("Family name page error:", err);
            setError(err.message || "Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim().length < 2) {
            setStatus("Ургийн овгийн нэр дор хаяж 2 үсэгтэй байх ёстой.");
            return;
        }
        router.replace(`${pathname}?search=${encodeURIComponent(search.trim())}`, {
            scroll: false,
        });
    };

    const topTableRows = useMemo(
        () =>
            topFamilies.map((item) => (
                <tr key={item.rowNo || item.name}>
                    <td className="text-center px-3 py-3 font-semibold border-b border-gray-200">{item.rowNo}</td>
                    <td className="text-center px-3 py-3 font-semibold border-b border-gray-200">
                        <button
                            type="button"
                            className="text-blue-600 hover:underline"
                            onClick={() =>
                                router.replace(
                                    `${pathname}?search=${encodeURIComponent(item.name)}`,
                                    { scroll: false }
                                )
                            }
                        >
                            {item.name}
                        </button>
                    </td>
                    <td className="text-center px-3 py-3 font-semibold border-b border-gray-200">{item.population.toLocaleString("mn-MN")}</td>
                </tr>
            )),
        [pathname, router, topFamilies]
    );

    return (
        <div className="nso_container">
            <div className="nso_statistic_section bg-white magazines px-4 py-8 w-full">
                <div className="w-full space-y-8">
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl md:text-4xl font-bold">Ургийн овгийн талаарх мэдээлэл</h1>
                        <p className="text-gray-600">
                            Улсын хэмжээнд түгээмэл ургийн овгийн жагсаалтыг үзэж, хүссэн овгийнхаа бүсчилсэн тархалтыг шалгана уу.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col md:flex-row items-center gap-3 md:gap-4"
                    >
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value.toUpperCase())}
                            placeholder="Ургийн овог хайх (жишээ: БАЯН)"
                            className="w-full md:flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                        />
                        <button
                            type="submit"
                            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            disabled={loading}
                        >
                            {loading ? "Тооцож байна..." : "Хайх"}
                        </button>
                        {mode === "aimag" && (
                            <button
                                type="button"
                                onClick={resetToTop}
                                className="w-full md:w-auto px-6 py-3 border border-gray-400 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Түгээмэл овгийн жагсаалт
                            </button>
                        )}
                    </form>

                    {status && (
                        <div className="text-center text-sm text-orange-500">{status}</div>
                    )}

                    {loading && (
                        <Loading />
                    )}

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    {!error && mode === "top" && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Хамгийн түгээмэл 20 ургийн овог</h2>
                            <div className="overflow-x-auto w-full">
                                <table className="min-w-full text-sm md:text-base border border-gray-200 rounded-lg bg-white shadow-sm">
                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 uppercase text-xs tracking-wide">
                                        <tr>
                                            <th className="px-3 py-3 text-center border-b border-gray-200">№</th>
                                            <th className="px-3 py-3 text-center border-b border-gray-200">Ургийн овог</th>
                                            <th className="px-3 py-3 text-center border-b border-gray-200">Нийт хүн</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={3} className="text-center py-6 text-gray-500">
                                                    Уншиж байна...
                                                </td>
                                            </tr>
                                        ) : (
                                            topTableRows
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {!error && mode === "aimag" && aimagData && (
                        <div className="space-y-4">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-semibold uppercase tracking-wide">
                                    {aimagData.familyName}
                                </h2>
                                <p className="text-gray-700">
                                    Монгол Улсад нийт{" "}
                                    <span className="font-bold">
                                        {aimagData.total.toLocaleString("mn-MN")}
                                    </span>{" "}
                                    хүн энэ ургийн овогтой байна.
                                </p>
                            </div>

                            <div className="overflow-x-auto w-full">
                                <table className="min-w-full text-sm md:text-base border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                                        <tr>
                                            <th className="px-3 py-3 text-center border-b border-gray-200">№</th>
                                            <th className="px-3 py-3 text-center border-b border-gray-200">Аймаг, хот</th>
                                            <th className="px-3 py-3 text-center border-b border-gray-200">Тоо</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {aimagData.regions.map((region) => (
                                            <tr key={`${region.name}-${region.rowNo}`}>
                                                <td className="text-center px-3 py-3 font-semibold border-b border-gray-200">
                                                    {region.rowNo}
                                                </td>
                                                <td className="text-center px-3 py-3 border-b border-gray-200">{region.name}</td>
                                                <td className="text-center px-3 py-3 border-b border-gray-200">
                                                    {region.population.toLocaleString("mn-MN")}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
