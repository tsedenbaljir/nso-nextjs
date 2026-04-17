"use client";

import { useMemo, useState } from "react";
import Loading from "@/app/[lng]/(client)/loading";
import { getSameDayPeopleCount } from "@/app/services/fun-statistic";

const monthOptions = [
    { value: 1, label: "1-р сар" },
    { value: 2, label: "2-р сар" },
    { value: 3, label: "3-р сар" },
    { value: 4, label: "4-р сар" },
    { value: 5, label: "5-р сар" },
    { value: 6, label: "6-р сар" },
    { value: 7, label: "7-р сар" },
    { value: 8, label: "8-р сар" },
    { value: 9, label: "9-р сар" },
    { value: 10, label: "10-р сар" },
    { value: 11, label: "11-р сар" },
    { value: 12, label: "12-р сар" },
];

export default function SameDayPeoplePage() {
    const currentYear = new Date().getFullYear();
    const minYear = 1900;

    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [day, setDay] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [result, setResult] = useState(null);

    const daysInSelectedMonth = useMemo(() => {
        const yearNum = Number(year);
        const monthNum = Number(month);
        if (!yearNum || !monthNum) {
            return 31;
        }
        return new Date(yearNum, monthNum, 0).getDate();
    }, [year, month]);

    const handleNewSearch = () => {
        setResult(null);
        setStatus(null);
        setYear("");
        setMonth("");
        setDay("");
        setTimeout(() => {
            document.getElementById("year-input")?.focus();
        }, 100);
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus(null);
        setResult(null);

        const yearNum = Number(year);
        const monthNum = Number(month);
        const dayNum = Number(day);

        if (!yearNum || yearNum < minYear || yearNum > currentYear) {
            setStatus(`Он ${minYear}-${currentYear} хооронд байх ёстой.`);
            return;
        }

        if (!monthNum || monthNum < 1 || monthNum > 12) {
            setStatus("Сар 1-12 хооронд байх ёстой.");
            return;
        }

        const maxDays = new Date(yearNum, monthNum, 0).getDate();
        if (!dayNum || dayNum < 1 || dayNum > maxDays) {
            setStatus(`${monthNum}-р сар ${maxDays} хоногтой.`);
            return;
        }

        setLoading(true);
        try {
            const data = await getSameDayPeopleCount({
                year: yearNum,
                month: monthNum,
                day: dayNum,
            });

            if (data.success) {
                setResult(data);
            } else {
                setStatus(data.error || "Өгөгдөл олдсонгүй.");
            }
        } catch (err) {
            console.error("Same day people error:", err);
            setStatus(err.message || "Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="nso_container">
            <div className="nso_statistic_section bg-white magazines px-4 py-8 w-full">
                <div className="space-y-8 w-full">
                    <section className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold">Тантай нэг өдөр төрсөн хүмүүс</h1>
                        <p className="text-gray-600 max-w-4xl mx-auto">
                            Төрсөн он, сар, өдрөө оруулж, тантай нэг өдөр төрсөн хүмүүсийн нийт тоог үзнэ үү.
                        </p>
                    </section>

                    {!result && (
                        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex flex-col flex-1 min-w-[160px]">
                                    <label htmlFor="year-input" className="text-sm font-medium text-gray-700 mb-2">
                                        Он
                                    </label>
                                    <input
                                        id="year-input"
                                        type="number"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        min={minYear}
                                        max={currentYear}
                                        placeholder={`${minYear}-${currentYear}`}
                                        className="h-14 px-4 text-lg font-medium border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex flex-col flex-1 min-w-[140px]">
                                    <label className="text-sm font-medium text-gray-700 mb-2">Сар</label>
                                    <select
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        className="h-14 px-4 text-lg font-medium border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                                    >
                                        <option value="">Сар сонгох</option>
                                        {monthOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col flex-1 min-w-[140px]">
                                    <label className="text-sm font-medium text-gray-700 mb-2">Өдөр</label>
                                    <input
                                        type="number"
                                        value={day}
                                        onChange={(e) => setDay(e.target.value)}
                                        min={1}
                                        max={daysInSelectedMonth}
                                        placeholder={`1-${daysInSelectedMonth}`}
                                        className="h-14 px-4 text-lg font-medium border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex flex-col flex-1 min-w-[140px]">
                                    <label className="text-sm font-medium text-gray-700 mb-2 opacity-0 select-none">
                                        ХАЙХ
                                    </label>
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={loading}
                                    >
                                        {loading ? "Тооцож байна..." : "ХАЙХ"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {status && (
                        <div className="text-center">
                            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                                {status}
                            </div>
                        </div>
                    )}

                    {loading && <Loading />}

                    {result && (
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center space-y-6">
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 border-2 border-blue-200">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                        {result.year} оны {result.month}-р сарын {result.day}-ны өдөр
                                    </h2>
                                    <div className="text-6xl md:text-7xl font-bold text-blue-600 mb-2">
                                        {result.count.toLocaleString("mn-MN")}
                                    </div>
                                    <p className="text-xl text-gray-700">
                                        хүн төрсөн байна
                                    </p>
                                </div>

                                <button
                                    onClick={handleNewSearch}
                                    className="px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-900 hover:text-white transition-colors"
                                >
                                    Дахин хайх
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

