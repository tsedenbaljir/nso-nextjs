"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Button,
    Card,
    DatePicker,
    Segmented,
    Spin,
    Table,
    Tooltip,
    message,
} from "antd";
import {
    DownloadOutlined,
    FileExcelOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip as ChartTooltip,
    XAxis,
    YAxis,
} from "recharts";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { RangePicker } = DatePicker;

// Match footer /api/analytic: 7daysAgo..today (8 inclusive calendar days)
const PRESETS = [
    { label: "7 хоног", ago: 7 },
    { label: "30 хоног", ago: 30 },
    { label: "90 хоног", ago: 90 },
    { label: "1 жил", ago: 365 },
];

const DEVICE_LABELS = {
    desktop: "Компьютер",
    mobile: "Гар утас",
    tablet: "Таблет",
    smart_tv: "Smart TV",
};

function formatNumber(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return Math.round(n).toLocaleString("en-US");
}

function formatDuration(seconds) {
    const total = Math.round(Number(seconds) || 0);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}м ${String(s).padStart(2, "0")}с`;
}

/** GA "20260901" -> "2026-09-01" */
function parseGaDate(raw) {
    const s = String(raw || "");
    if (!/^\d{8}$/.test(s)) return s;
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

export default function AnalyticsAdminPage() {
    const [range, setRange] = useState([dayjs().subtract(7, "day"), dayjs()]);
    const [preset, setPreset] = useState("7 хоног");
    const [data, setData] = useState(null);
    const [siteTraffic, setSiteTraffic] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [warning, setWarning] = useState(null);

    const startDate = range?.[0]?.format("YYYY-MM-DD");
    const endDate = range?.[1]?.format("YYYY-MM-DD");

    const fetchData = useCallback(
        async (from, to, refresh = false) => {
            if (!from || !to) return;
            setLoading(true);
            setError(null);
            setWarning(null);
            try {
                const params = new URLSearchParams({ startDate: from, endDate: to });
                if (refresh) params.set("refresh", "1");
                const res = await fetch(`/api/analytic/admin?${params}`, {
                    cache: "no-store",
                });
                const text = await res.text();
                let result = null;
                try {
                    result = text ? JSON.parse(text) : null;
                } catch {
                    result = null;
                }
                if (!result) {
                    setError({
                        title: "Серверийн хариу хоосон",
                        message:
                            "Google Analytics-с хариу ирээгүй эсвэл сервер алдаатай зогссон. " +
                            "Хэсэг хүлээгээд дахин оролдоно уу. Квот дүүрсэн бол 10–15 минут хүлээнэ үү.",
                    });
                    return;
                }
                if (result?.siteTraffic) {
                    setSiteTraffic(result.siteTraffic);
                }
                if (result?.status && result.summary) {
                    setData(result);
                    if (result.warning) {
                        setWarning(result.warning);
                    } else if (result.stale) {
                        setWarning({
                            title: "Хадгалсан өгөгдөл",
                            message: "Шинэ тоо татаж чадаагүй тул сүүлд хадгалсан тоог харуулж байна.",
                        });
                    }
                    return;
                }
                const title = result.title || "Өгөгдөл татахад алдаа гарлаа";
                const msg =
                    result.message ||
                    "Google Analytics-с мэдээлэл авч чадсангүй. Хэсэг хугацааны дараа дахин оролдоно уу.";
                setError({ title, message: msg });
            } catch (err) {
                console.error(err);
                setError({
                    title: "Сүлжээний алдаа",
                    message: "Сервертэй холбогдож чадсангүй. Интернэтээ шалгаад дахин оролдоно уу.",
                });
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchData(startDate, endDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const applyPreset = (label) => {
        const found = PRESETS.find((p) => p.label === label);
        if (!found) return;
        const next = [dayjs().subtract(found.ago, "day"), dayjs()];
        setPreset(label);
        setRange(next);
        fetchData(next[0].format("YYYY-MM-DD"), next[1].format("YYYY-MM-DD"));
    };

    const chartData = useMemo(
        () =>
            (data?.daily || []).map((row) => ({
                date: parseGaDate(row.date),
                Хандалт: row.activeUsers,
            })),
        [data]
    );

    const siteCards = useMemo(
        () => [
            { title: "Өнөөдөр", value: formatNumber(siteTraffic?.today), color: "#0f4c81" },
            { title: "7 хоногт", value: formatNumber(siteTraffic?.week), color: "#3FD97F" },
            { title: "Энэ сард", value: formatNumber(siteTraffic?.month), color: "#FF9C55" },
            { title: "Нийт", value: formatNumber(siteTraffic?.total), color: "#8155FF" },
        ],
        [siteTraffic]
    );

    const summaryCards = useMemo(() => {
        const s = data?.summary || {};
        return [
            { title: "Хандалт (хэрэглэгч)", value: formatNumber(s.activeUsers), color: "#0f4c81" },
            { title: "Шинэ хэрэглэгч", value: formatNumber(s.newUsers), color: "#8155FF" },
            { title: "Сешн", value: formatNumber(s.sessions), color: "#FF9C55" },
            {
                title: "Дундаж хугацаа",
                value: formatDuration(s.averageSessionDuration),
                color: "#00b8d9",
            },
        ];
    }, [data]);

    const dailyColumns = [
        { title: "Өдөр", dataIndex: "date", key: "date", width: 130 },
        {
            title: "Хэрэглэгч",
            dataIndex: "activeUsers",
            key: "activeUsers",
            align: "right",
            render: formatNumber,
            sorter: (a, b) => a.activeUsers - b.activeUsers,
        },
        {
            title: "Шинэ",
            dataIndex: "newUsers",
            key: "newUsers",
            align: "right",
            render: formatNumber,
            sorter: (a, b) => a.newUsers - b.newUsers,
        },
        {
            title: "Сешн",
            dataIndex: "sessions",
            key: "sessions",
            align: "right",
            render: formatNumber,
            sorter: (a, b) => a.sessions - b.sessions,
        },
        {
            title: "Хуудас үзсэн",
            dataIndex: "screenPageViews",
            key: "screenPageViews",
            align: "right",
            render: formatNumber,
            sorter: (a, b) => a.screenPageViews - b.screenPageViews,
        },
    ];

    const pageColumns = [
        {
            title: "Хуудас",
            dataIndex: "pagePath",
            key: "pagePath",
            render: (value, row) => (
                <div className="min-w-0">
                    <div className="truncate font-medium" title={row.pageTitle || value}>
                        {row.pageTitle || value}
                    </div>
                    <div className="truncate text-xs text-gray-500" title={value}>
                        {value}
                    </div>
                </div>
            ),
        },
        {
            title: "Үзсэн",
            dataIndex: "screenPageViews",
            key: "screenPageViews",
            align: "right",
            width: 120,
            render: formatNumber,
            sorter: (a, b) => a.screenPageViews - b.screenPageViews,
        },
        {
            title: "Хэрэглэгч",
            dataIndex: "activeUsers",
            key: "activeUsers",
            align: "right",
            width: 120,
            render: formatNumber,
            sorter: (a, b) => a.activeUsers - b.activeUsers,
        },
    ];

    const deviceColumns = [
        {
            title: "Төхөөрөмж",
            dataIndex: "deviceCategory",
            key: "deviceCategory",
            render: (value) => DEVICE_LABELS[value] || value,
        },
        {
            title: "Хэрэглэгч",
            dataIndex: "activeUsers",
            key: "activeUsers",
            align: "right",
            render: formatNumber,
        },
        {
            title: "Сешн",
            dataIndex: "sessions",
            key: "sessions",
            align: "right",
            render: formatNumber,
        },
    ];

    const countryColumns = [
        { title: "Улс", dataIndex: "country", key: "country" },
        {
            title: "Хэрэглэгч",
            dataIndex: "activeUsers",
            key: "activeUsers",
            align: "right",
            render: formatNumber,
            sorter: (a, b) => a.activeUsers - b.activeUsers,
        },
        {
            title: "Сешн",
            dataIndex: "sessions",
            key: "sessions",
            align: "right",
            render: formatNumber,
            sorter: (a, b) => a.sessions - b.sessions,
        },
    ];

    const buildWorkbook = () => {
        const s = data?.summary || {};
        const wb = XLSX.utils.book_new();

        const summaryRows = [
            { Үзүүлэлт: "Өнөөдөр", Утга: Math.round(siteTraffic?.today || 0) },
            { Үзүүлэлт: "7 хоногт", Утга: Math.round(siteTraffic?.week || 0) },
            { Үзүүлэлт: "Энэ сард", Утга: Math.round(siteTraffic?.month || 0) },
            { Үзүүлэлт: "Нийт", Утга: Math.round(siteTraffic?.total || 0) },
            { Үзүүлэлт: "Сонгосон хугацаа", Утга: `${data.range.startDate} — ${data.range.endDate}` },
            { Үзүүлэлт: "Хандалт (хэрэглэгч)", Утга: Math.round(s.activeUsers || 0) },
            { Үзүүлэлт: "Шинэ хэрэглэгч", Утга: Math.round(s.newUsers || 0) },
            { Үзүүлэлт: "Сешн", Утга: Math.round(s.sessions || 0) },
        ];
        const ws1 = XLSX.utils.json_to_sheet(summaryRows);
        ws1["!cols"] = [{ wch: 24 }, { wch: 26 }];
        XLSX.utils.book_append_sheet(wb, ws1, "Хураангуй");

        const dailyRows = (data.daily || []).map((row, i) => ({
            "№": i + 1,
            Өдөр: parseGaDate(row.date),
            Хэрэглэгч: row.activeUsers,
            Шинэ: row.newUsers,
            Сешн: row.sessions,
            "Хуудас үзсэн": row.screenPageViews,
        }));
        const ws2 = XLSX.utils.json_to_sheet(dailyRows);
        ws2["!cols"] = [{ wch: 5 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 14 }];
        XLSX.utils.book_append_sheet(wb, ws2, "Өдрөөр");

        const pageRows = (data.pages || []).map((row, i) => ({
            "№": i + 1,
            Хуудас: row.pagePath,
            Гарчиг: row.pageTitle,
            "Үзсэн тоо": row.screenPageViews,
            Хэрэглэгч: row.activeUsers,
        }));
        const ws3 = XLSX.utils.json_to_sheet(pageRows);
        ws3["!cols"] = [{ wch: 5 }, { wch: 45 }, { wch: 40 }, { wch: 12 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, ws3, "Хуудсаар");

        const deviceRows = (data.devices || []).map((row, i) => ({
            "№": i + 1,
            Төхөөрөмж: DEVICE_LABELS[row.deviceCategory] || row.deviceCategory,
            Хэрэглэгч: row.activeUsers,
            Сешн: row.sessions,
        }));
        const ws4 = XLSX.utils.json_to_sheet(deviceRows);
        ws4["!cols"] = [{ wch: 5 }, { wch: 18 }, { wch: 12 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(wb, ws4, "Төхөөрөмж");

        const countryRows = (data.countries || []).map((row, i) => ({
            "№": i + 1,
            Улс: row.country,
            Хэрэглэгч: row.activeUsers,
            Сешн: row.sessions,
        }));
        const ws5 = XLSX.utils.json_to_sheet(countryRows);
        ws5["!cols"] = [{ wch: 5 }, { wch: 26 }, { wch: 12 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(wb, ws5, "Улс");

        return wb;
    };

    const handleExcelDownload = () => {
        if (!data) {
            message.warning("Татах өгөгдөл байхгүй байна.");
            return;
        }
        const wb = buildWorkbook();
        const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(
            new Blob([out], { type: "application/octet-stream" }),
            `handalt-${data.range.startDate}-${data.range.endDate}.xlsx`
        );
    };

    const handleCsvDownload = () => {
        if (!data) {
            message.warning("Татах өгөгдөл байхгүй байна.");
            return;
        }
        const header = ["Өдөр", "Хэрэглэгч", "Шинэ", "Сешн", "Хуудас үзсэн"];
        const lines = [header.join(",")];
        for (const row of data.daily || []) {
            lines.push(
                [
                    parseGaDate(row.date),
                    row.activeUsers,
                    row.newUsers,
                    row.sessions,
                    row.screenPageViews,
                ].join(",")
            );
        }
        // BOM so Excel reads Cyrillic correctly
        const blob = new Blob(["\uFEFF" + lines.join("\n")], {
            type: "text/csv;charset=utf-8;",
        });
        saveAs(blob, `handalt-${data.range.startDate}-${data.range.endDate}.csv`);
    };

    return (
        <div className="p-3">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="m-0 text-2xl font-bold">Хэрэглэгчийн хандалт</h1>
                    <p className="mb-0 text-sm text-gray-500">
                        1212-ын footer-тэй ижил үзүүлэлт: өвөрмөц хэрэглэгч (activeUsers).
                        Хугацаагаа сонгоод харах, татаж авах боломжтой.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Tooltip title="Excel-ээр татах">
                        <Button
                            icon={<FileExcelOutlined />}
                            onClick={handleExcelDownload}
                            disabled={!data || loading}
                        >
                            Excel
                        </Button>
                    </Tooltip>
                    <Tooltip title="Өдрөөрх өгөгдлийг CSV-ээр татах">
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={handleCsvDownload}
                            disabled={!data || loading}
                        >
                            CSV
                        </Button>
                    </Tooltip>
                </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {siteCards.map((card) => (
                    <div
                        key={card.title}
                        className="rounded-[10px] bg-[#0f4c81] p-4 text-white shadow-sm"
                    >
                        <div className="text-sm font-medium text-white/80">{card.title}</div>
                        <div className="mt-1 text-2xl font-bold">{card.value}</div>
                    </div>
                ))}
            </div>
            <p className="mb-3 text-xs text-gray-500">
                Сайтын хандалт — 1212 footer-тэй ижил тоо (өвөрмөц хэрэглэгч).
            </p>

            <Card className="mb-4" size="small">
                <div className="flex flex-wrap items-center gap-3">
                    <RangePicker
                        value={range}
                        onChange={(value) => {
                            setRange(value);
                            setPreset(undefined);
                        }}
                        format="YYYY-MM-DD"
                        allowClear={false}
                        disabledDate={(current) => current && current > dayjs().endOf("day")}
                    />
                    <Button
                        type="primary"
                        onClick={() => fetchData(startDate, endDate)}
                        loading={loading}
                        disabled={loading || !startDate || !endDate}
                    >
                        Харах
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => fetchData(startDate, endDate, true)}
                        disabled={loading}
                    >
                        Сэргээх
                    </Button>
                    <Segmented
                        options={PRESETS.map((p) => p.label)}
                        value={preset}
                        onChange={applyPreset}
                    />
                </div>
                {data?.cached && !warning && (
                    <p className="mb-0 mt-2 text-xs text-gray-500">
                        Хадгалсан өгөгдөл (30 минут). Шинэчлэх бол «Сэргээх» — гэхдээ квот дүүрсэн үед хүлээнэ үү.
                    </p>
                )}
            </Card>

            {(error || warning) && (
                <Alert
                    className="mb-4"
                    type={error ? "error" : "warning"}
                    showIcon
                    message={error?.title || warning?.title}
                    description={error?.message || warning?.message}
                />
            )}

            {loading && !data ? (
                <div className="flex min-h-[300px] items-center justify-center">
                    <Spin size="large" />
                </div>
            ) : (
                data && (
                    <Spin spinning={loading}>
                        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {summaryCards.map((card) => (
                                <div
                                    key={card.title}
                                    className="rounded-[10px] border border-gray-200 bg-white p-4 shadow-sm"
                                >
                                    <div
                                        className="mb-2 h-1.5 w-10 rounded-full"
                                        style={{ backgroundColor: card.color }}
                                    />
                                    <div className="text-sm text-gray-500">{card.title}</div>
                                    <div className="mt-1 text-2xl font-bold text-gray-900">
                                        {card.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Card title="Хандалтын хөдөлгөөн (өвөрмөц хэрэглэгч)" className="mb-4" size="small">
                            <div style={{ width: "100%", height: 320 }}>
                                <ResponsiveContainer>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={24} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <ChartTooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="Хандалт"
                                            stroke="#0f4c81"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <Card title="Өдрөөр" size="small">
                                <Table
                                    rowKey="date"
                                    size="small"
                                    columns={dailyColumns}
                                    dataSource={(data.daily || []).map((row) => ({
                                        ...row,
                                        date: parseGaDate(row.date),
                                    }))}
                                    pagination={{ pageSize: 10, showSizeChanger: false }}
                                    scroll={{ x: true }}
                                />
                            </Card>

                            <Card title="Их үзсэн хуудсууд" size="small">
                                <Table
                                    rowKey={(row) => `${row.pagePath}-${row.pageTitle}`}
                                    size="small"
                                    columns={pageColumns}
                                    dataSource={data.pages || []}
                                    pagination={{ pageSize: 10, showSizeChanger: false }}
                                    scroll={{ x: true }}
                                />
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            <Card title="Төхөөрөмжөөр" size="small">
                                <Table
                                    rowKey="deviceCategory"
                                    size="small"
                                    columns={deviceColumns}
                                    dataSource={data.devices || []}
                                    pagination={false}
                                />
                            </Card>

                            <Card title="Улсаар" size="small">
                                <Table
                                    rowKey="country"
                                    size="small"
                                    columns={countryColumns}
                                    dataSource={data.countries || []}
                                    pagination={{ pageSize: 10, showSizeChanger: false }}
                                />
                            </Card>
                        </div>
                    </Spin>
                )
            )}
        </div>
    );
}
