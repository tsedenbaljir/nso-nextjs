'use client';

import Highcharts from 'highcharts';
import dynamic from 'next/dynamic';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import Offline from 'highcharts/modules/offline-exporting';

// Helper to init a module regardless of export shape
function initModule(mod) {
    if (!mod) return;
    if (typeof mod === 'function') mod(Highcharts);
    else if (mod.default && typeof mod.default === 'function') mod.default(Highcharts);
}

// Init modules ONLY on client
if (typeof window !== 'undefined') {
    initModule(Exporting);
    initModule(ExportData);
    initModule(Offline);
}

// Import the React wrapper without SSR
const HighchartsReact = dynamic(() => import('highcharts-react-official'), { ssr: false });


export default function LineChart({ data, lng, title }) {
    if (!data || !data.id || !data.dimension || !data.value || !data.size) {
        return null;
    }

    // Find year/time dimension
    const yearKey = data.id.find((key) =>
        ['он', 'жил', 'улирал', 'хугацаа', 'сар'].some((kw) => key.toLowerCase() === kw)
    );

    if (!yearKey || !data.dimension[yearKey]) return null;

    const years = Object.entries(data.dimension[yearKey].category.index).map(
        ([code]) => ({
            code,
            label: data.dimension[yearKey].category.label[code] || code,
        })
    ).reverse();

    const rowKeys = data.id.filter((key) => key !== yearKey);
    const validRowKeys = rowKeys.filter((key) => data.dimension[key]).map(key => ({
        key,
        label: data.dimension[key].label || key
    }));

    const rowDimensions = validRowKeys.map(({ key, label: dimensionLabel }) => {
        const index = data.dimension[key].category.index;
        const label = data.dimension[key].category.label;
        return Object.entries(index).map(([code, idx]) => ({
            code,
            label: label[code] || code,
            idx,
            key,
            dimensionLabel,
        })).sort((a, b) => a.idx - b.idx);
    });

    const combinations = [];
    const generateCombinations = (dims, prefix = []) => {
        if (dims.length === 0) {
            combinations.push(prefix);
            return;
        }
        for (const val of dims[0]) {
            generateCombinations(dims.slice(1), [...prefix, val]);
        }
    };
    generateCombinations(rowDimensions);

    const series = combinations.map((combo) => {
        const indices = combo.map((c) => c.idx);
        const yearData = years.map(({ code, label }) => {
            const yearIdx = data.dimension[yearKey].category.index[code];
            const dimSizes = [...indices, yearIdx];
            const idx = dimSizes.reduce(
                (acc, currIdx, i) =>
                    acc + currIdx * data.size.slice(i + 1).reduce((a, b) => a * b, 1),
                0
            );
            return [label, data.value[idx] ?? null];
        }).filter(([_, value]) => value !== null);

        const seriesName = combo.map(c => c.label).join(' - ');

        return {
            name: seriesName,
            data: yearData,
            type: 'line'
        };
    });

    const chartOptions = {
        chart: {
            type: 'line',
            height: 800
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: years.map(y => y.label),
            title: {
                text: lng === 'mn' ? 'Хугацаа' : 'Time Period'
            }
        },
        yAxis: {
            title: {
                text: lng === 'mn' ? 'Утга' : 'Value'
            }
        },
        tooltip: {
            formatter: function () {
                return `<b>${this.series.name}</b><br/>
                ${lng === 'mn' ? 'Хугацаа' : 'Period'}: ${this.x}<br/>
                ${lng === 'mn' ? 'Утга' : 'Value'}: ${this.y?.toLocaleString('mn-MN') || '—'}`;
            }
        },
        legend: {
            enabled: true
        },
        plotOptions: {
            line: {
                marker: {
                    enabled: true
                },
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        return this.y?.toLocaleString('mn-MN') || '';
                    },
                    style: {
                        fontSize: '11px',
                        fontWeight: 'normal'
                    }
                }
            }
        },
        exporting: {
            enabled: true, // enables the export button
            buttons: {
                contextButton: {
                    menuItems: [
                        'viewFullscreen',
                        'printChart',
                        'separator',
                        'downloadPNG',
                        'downloadJPEG'
                    ]
                }
            },
            chartOptions: {
                title: {
                    text: title
                },
                subtitle: {
                    text: lng === 'mn' ? 'Эх сурвалж: www.nso.mn, www.1212.mn' : 'Source: www.nso.mn, www.1212.mn',
                    align: 'left',
                    x: 10,
                    y: 30,
                    style: {
                        fontSize: '10px',
                        color: '#666'
                    }
                }
            },
            filename: 'linechart_' + new Date().toISOString().slice(0, 10)
        },
        series: series
    };

    return (
        <div className="mt-3">
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
    );
} 