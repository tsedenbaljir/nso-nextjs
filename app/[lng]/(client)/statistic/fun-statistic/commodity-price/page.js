"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Select, Spin } from "antd";
import {
    compareCommodityPrices,
    getCommodityPeriods,
    getCommodityPrice,
    getCommodityProducts,
} from "@/app/services/fun-statistic-actions";

const MONTH_LABELS = {
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "10",
    11: "11",
    12: "12",
};

function periodKey(year, month) {
    if (year == null || month == null) return null;
    return `${year}-${String(month).padStart(2, "0")}`;
}

/** e.g. 13600 → "13 600" (space thousand separator) */
function formatPriceSpaces(value) {
    if (value == null || !Number.isFinite(Number(value))) return null;
    return String(Math.round(Number(value))).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function priceDisplayLabel(priceResult) {
    if (!priceResult) return null;
    if (priceResult.price != null) {
        const n = formatPriceSpaces(priceResult.price);
        if (n != null) return `${n} төгрөг`;
    }
    return priceResult.priceLabel || null;
}

/** numeric order for year-month: later period has higher value */
function periodOrder(year, month) {
    if (year == null || month == null) return null;
    return Number(year) * 12 + Number(month);
}

function isPeriodAfter(yearA, monthA, yearB, monthB) {
    const a = periodOrder(yearA, monthA);
    const b = periodOrder(yearB, monthB);
    if (a == null || b == null) return false;
    return b > a;
}

export default function CommodityPricePage() {
    const [products, setProducts] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [productCode, setProductCode] = useState(undefined);
    const [yearFrom, setYearFrom] = useState(undefined);
    const [monthFrom, setMonthFrom] = useState(undefined);
    const [yearTo, setYearTo] = useState(undefined);
    const [monthTo, setMonthTo] = useState(undefined);
    const [loadingMeta, setLoadingMeta] = useState(true);
    const [comparing, setComparing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [priceFrom, setPriceFrom] = useState(null);
    const [priceTo, setPriceTo] = useState(null);
    const [loadingPriceFrom, setLoadingPriceFrom] = useState(false);
    const [loadingPriceTo, setLoadingPriceTo] = useState(false);

    const productOptions = useMemo(
        () =>
            [...products]
                .sort((a, b) =>
                    String(a.name || "").localeCompare(String(b.name || ""), "mn", {
                        sensitivity: "base",
                    })
                )
                .map((p) => ({
                    value: p.code,
                    label: p.name,
                })),
        [products]
    );

    const monthsForYear = (year) => {
        if (year == null) return [];
        return periods
            .filter((p) => p.year === year)
            .map((p) => p.month)
            .sort((a, b) => a - b);
    };

    const yearFromOptions = useMemo(() => {
        // эхний он: must leave at least one later period for compare
        const years = [...new Set(periods.map((p) => p.year))].sort((a, b) => b - a);
        return years
            .filter((y) =>
                monthsForYear(y).some((m) =>
                    periods.some((p) => isPeriodAfter(y, m, p.year, p.month))
                )
            )
            .map((y) => ({ value: y, label: String(y) }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periods]);

    const monthFromOptions = useMemo(() => {
        if (yearFrom == null) return [];
        return monthsForYear(yearFrom)
            .filter((m) =>
                periods.some((p) => isPeriodAfter(yearFrom, m, p.year, p.month))
            )
            .map((m) => ({
                value: m,
                label: MONTH_LABELS[m] || `${m}`,
            }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [yearFrom, periods]);

    const yearToOptions = useMemo(() => {
        const years = [...new Set(periods.map((p) => p.year))].sort((a, b) => b - a);
        if (yearFrom == null) {
            return years.map((y) => ({ value: y, label: String(y) }));
        }
        // харьцуулах он >= эхний он; same year only if a later month exists
        return years
            .filter((y) => {
                if (y > yearFrom) return true;
                if (y < yearFrom) return false;
                if (monthFrom == null) {
                    // same year allowed once monthFrom is chosen; keep year if multiple months exist
                    return monthsForYear(y).length > 1;
                }
                return monthsForYear(y).some((m) => m > monthFrom);
            })
            .map((y) => ({ value: y, label: String(y) }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [yearFrom, monthFrom, periods]);

    const monthToOptions = useMemo(() => {
        if (yearTo == null) return [];
        return monthsForYear(yearTo)
            .filter((m) => {
                if (yearFrom == null || monthFrom == null) return true;
                return isPeriodAfter(yearFrom, monthFrom, yearTo, m);
            })
            .map((m) => ({
                value: m,
                label: MONTH_LABELS[m] || `${m}`,
            }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [yearTo, yearFrom, monthFrom, periods]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoadingMeta(true);
            setError(null);
            try {
                const [pRes, tRes] = await Promise.all([
                    getCommodityProducts(),
                    getCommodityPeriods(),
                ]);
                if (cancelled) return;
                if (!pRes.success || !tRes.success) {
                    setError(pRes.error || tRes.error || "Өгөгдөл татахад алдаа гарлаа.");
                    return;
                }
                setProducts(pRes.products || []);
                setPeriods(tRes.periods || []);
            } catch (err) {
                if (!cancelled) setError(err.message || "Сүлжээний алдаа.");
            } finally {
                if (!cancelled) setLoadingMeta(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    // Clear month when year is cleared, or if current month is invalid
    useEffect(() => {
        if (yearFrom == null) {
            setMonthFrom(undefined);
            return;
        }
        if (monthFrom != null) {
            const valid = monthFromOptions.some((m) => m.value === monthFrom);
            if (!valid) setMonthFrom(undefined);
        }
    }, [yearFrom, periods, monthFrom, monthFromOptions]);

    useEffect(() => {
        if (yearTo == null) {
            setMonthTo(undefined);
            return;
        }
        if (monthTo != null) {
            const valid = monthToOptions.some((m) => m.value === monthTo);
            if (!valid) setMonthTo(undefined);
        }
    }, [yearTo, monthTo, monthToOptions]);

    // Харьцуулах он always after эхний — clear if invalid
    useEffect(() => {
        if (yearTo == null) return;
        const ok = yearToOptions.some((y) => y.value === yearTo);
        if (!ok) {
            setYearTo(undefined);
            setMonthTo(undefined);
        }
    }, [yearFrom, monthFrom, yearTo, yearToOptions]);

    useEffect(() => {
        setResult(null);
        setError(null);
    }, [productCode, yearFrom, monthFrom, yearTo, monthTo]);

    const periodFrom = periodKey(yearFrom, monthFrom);
    const periodTo = periodKey(yearTo, monthTo);
    const periodsOrdered =
        yearFrom != null &&
        monthFrom != null &&
        yearTo != null &&
        monthTo != null &&
        isPeriodAfter(yearFrom, monthFrom, yearTo, monthTo);

    useEffect(() => {
        let cancelled = false;
        if (!productCode || !periodFrom) {
            setPriceFrom(null);
            return;
        }
        (async () => {
            setLoadingPriceFrom(true);
            try {
                const res = await getCommodityPrice({
                    productCode,
                    periodCode: periodFrom,
                });
                if (!cancelled) {
                    setPriceFrom(res.success ? res : null);
                }
            } catch {
                if (!cancelled) setPriceFrom(null);
            } finally {
                if (!cancelled) setLoadingPriceFrom(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [productCode, periodFrom]);

    useEffect(() => {
        let cancelled = false;
        if (!productCode || !periodTo) {
            setPriceTo(null);
            return;
        }
        (async () => {
            setLoadingPriceTo(true);
            try {
                const res = await getCommodityPrice({
                    productCode,
                    periodCode: periodTo,
                });
                if (!cancelled) {
                    setPriceTo(res.success ? res : null);
                }
            } catch {
                if (!cancelled) setPriceTo(null);
            } finally {
                if (!cancelled) setLoadingPriceTo(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [productCode, periodTo]);

    async function handleCompare() {
        setError(null);
        setResult(null);
        if (!periodsOrdered) {
            setError("Харьцуулах хугацаа эхний хугацаанаас хойш байх ёстой.");
            return;
        }
        setComparing(true);
        try {
            const res = await compareCommodityPrices({
                productCode,
                periodFrom,
                periodTo,
            });
            if (!res.success) {
                setError(res.error || "Харьцуулалт амжилтгүй.");
                return;
            }
            setResult(res);
        } catch (err) {
            setError(err.message || "Сүлжээний алдаа.");
        } finally {
            setComparing(false);
        }
    }

    const canCompare =
        Boolean(productCode && periodFrom && periodTo) && periodsOrdered;

    const selectProps = {
        showSearch: true,
        size: "large",
        optionFilterProp: "label",
        allowClear: true,
        style: { width: "100%" },
        popupMatchSelectWidth: true,
    };

    // Center selected value + dropdown labels for month selects
    const monthSelectProps = {
        ...selectProps,
        className:
            "commodity-month-select " +
            "[&_.ant-select-selector]:!flex [&_.ant-select-selector]:!items-center " +
            "[&_.ant-select-selection-wrap]:!w-full [&_.ant-select-selection-wrap]:!text-center " +
            "[&_.ant-select-selection-item]:!float-none [&_.ant-select-selection-item]:!text-center " +
            "[&_.ant-select-selection-item]:!pe-6 [&_.ant-select-selection-item]:!ps-6 " +
            "[&_.ant-select-selection-placeholder]:!start-0 [&_.ant-select-selection-placeholder]:!end-0 " +
            "[&_.ant-select-selection-placeholder]:!inset-inline-start-0 [&_.ant-select-selection-placeholder]:!inset-inline-end-8 " +
            "[&_.ant-select-selection-placeholder]:!w-auto [&_.ant-select-selection-placeholder]:!text-center " +
            "[&_.ant-select-selection-search]:!inset-inline-start-0",
        classNames: {
            popup: {
                root: "[&_.ant-select-item-option-content]:!text-center",
            },
        },
    };

    return (
        <div className="nso_container">
            <div className="mx-auto w-full max-w-3xl px-4 py-1 sm:px-6">
                <section className="mb-4 text-center">
                    <h1 className="text-2xl font-bold text-[#0f4c81] md:text-3xl">
                        Гол нэрийн барааны үнийн харьцуулалт
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 md:text-base">
                        Бүтээгдэхүүн, эхний болон харьцуулах хугацааг сонгож, үнийг харьцуулна уу.
                    </p>
                </section>

                {loadingMeta ? (
                    <div className="flex justify-center py-5">
                        <Spin size="large" />
                    </div>
                ) : (
                    <div className="mx-auto flex w-full flex-col items-center">
                        <div className="w-full space-y-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                            <div className="flex w-full flex-col gap-2">
                                <label className="text-center text-sm font-semibold text-gray-800">
                                    Бүтээгдэхүүн
                                </label>
                                <Select
                                    {...selectProps}
                                    placeholder="Сонгоно уу"
                                    value={productCode}
                                    onChange={setProductCode}
                                    options={productOptions}
                                />
                            </div>

                            <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-4">
                                <div className="min-w-0 w-full flex-1 rounded-lg border border-gray-200 bg-gray-100 p-3 sm:p-4">
                                    <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-[#0f4c81]">
                                        Эхний хугацаа
                                    </p>
                                    <div className="flex w-full flex-row gap-3">
                                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                                            <label className="text-center text-sm font-medium text-gray-700">
                                                Он
                                            </label>
                                            <Select
                                                {...selectProps}
                                                placeholder="Сонгоно уу"
                                                value={yearFrom}
                                                onChange={setYearFrom}
                                                options={yearFromOptions}
                                            />
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                                            <label className="text-center text-sm font-medium text-gray-700">
                                                Сар
                                            </label>
                                            <Select
                                                {...monthSelectProps}
                                                placeholder="Сонгоно уу"
                                                value={monthFrom}
                                                onChange={setMonthFrom}
                                                options={monthFromOptions}
                                                disabled={yearFrom == null}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 flex min-h-[48px] items-center justify-center rounded-md border border-gray-300 bg-[#cfe8f8] px-3 py-2 text-center">
                                        {loadingPriceFrom ? (
                                            <Spin size="small" />
                                        ) : priceDisplayLabel(priceFrom) ? (
                                            <span className="text-base font-semibold text-gray-900">
                                                {priceDisplayLabel(priceFrom)}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-500">— төгрөг</span>
                                        )}
                                    </div>
                                </div>

                                <div className="min-w-0 w-full flex-1 rounded-lg border border-blue-100 bg-blue-50/60 p-3 sm:p-4">
                                    <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-[#0f4c81]">
                                        Харьцуулах хугацаа
                                    </p>
                                    <div className="flex w-full flex-row gap-3">
                                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                                            <label className="text-center text-sm font-medium text-gray-700">
                                                Он
                                            </label>
                                            <Select
                                                {...selectProps}
                                                placeholder="Сонгоно уу"
                                                value={yearTo}
                                                onChange={setYearTo}
                                                options={yearToOptions}
                                                disabled={yearFrom == null}
                                            />
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                                            <label className="text-center text-sm font-medium text-gray-700">
                                                Сар
                                            </label>
                                            <Select
                                                {...monthSelectProps}
                                                placeholder="Сонгоно уу"
                                                value={monthTo}
                                                onChange={setMonthTo}
                                                options={monthToOptions}
                                                disabled={yearTo == null || monthFrom == null}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 flex min-h-[48px] items-center justify-center rounded-md border border-gray-300 bg-[#cfe8f8] px-3 py-2 text-center">
                                        {loadingPriceTo ? (
                                            <Spin size="small" />
                                        ) : priceDisplayLabel(priceTo) ? (
                                            <span className="text-base font-semibold text-gray-900">
                                                {priceDisplayLabel(priceTo)}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-500">— төгрөг</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full justify-center pt-2">
                                <Button
                                    type="primary"
                                    size="large"
                                    loading={comparing}
                                    disabled={!canCompare}
                                    onClick={handleCompare}
                                    className="mx-auto h-12 min-w-[200px] text-base font-bold uppercase !bg-[#e67e22] !border-[#e67e22] hover:!bg-[#d35400] hover:!border-[#d35400] sm:min-w-[240px]"
                                >
                                    Харьцуулах
                                </Button>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-6 w-full rounded border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {result?.sentenceParts && (
                            <div className="mt-6 w-full">
                                <div className="rounded border border-gray-800 bg-[#cfe8f8] px-4 py-5 text-center text-base leading-relaxed text-gray-900 sm:px-6 md:text-lg">
                                    <span>{result.sentenceParts.prefix}</span>
                                    <strong>{result.sentenceParts.current}</strong>
                                    <span>{result.sentenceParts.mid}</span>
                                    <strong>{result.sentenceParts.base}</strong>
                                    <span>{result.sentenceParts.mid2}</span>
                                    <strong>{result.sentenceParts.change}</strong>
                                    <span>{result.sentenceParts.suffix}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}


