'use client';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export default function PieChart({ data, lng }) {
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

    // Create pie charts for each year
    const yearCharts = years.map((year) => {
        const pieData = combinations.map((combo) => {
            const indices = combo.map((c) => c.idx);
            const yearIdx = data.dimension[yearKey].category.index[year.code];
            const dimSizes = [...indices, yearIdx];
            const idx = dimSizes.reduce(
                (acc, currIdx, i) =>
                    acc + currIdx * data.size.slice(i + 1).reduce((a, b) => a * b, 1),
                0
            );
            const value = data.value[idx] ?? 0;
            const name = combo.map(c => c.label).join(' - ');

            return {
                name: name,
                y: value
            };
        }).filter(item => item.y > 0);

        const chartOptions = {
            chart: {
                type: 'pie',
                height: 400
            },
            title: {
                text: lng === 'mn' ? 'Дугуй график' : 'Pie Chart'
            },
            subtitle: {
                text: lng === 'mn' ? `${year.label} оны мэдээлэл` : `Data for ${year.label}`
            },
            tooltip: {
                formatter: function () {
                    const percentage = ((this.y / this.total) * 100).toFixed(1);
                    return `<b>${this.point.name}</b><br/>
                ${lng === 'mn' ? 'Утга' : 'Value'}: ${this.y?.toLocaleString('mn-MN') || '0'}<br/>
                ${lng === 'mn' ? 'Хувь' : 'Percentage'}: ${percentage}%`;
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            fontSize: '11px',
                            fontWeight: 'bold'
                        }
                    }
                }
            },
            series: [{
                name: lng === 'mn' ? 'Утга' : 'Value',
                colorByPoint: true,
                data: pieData
            }]
        };

        return {
            year: year,
            options: chartOptions
        };
    });

    return (
        <div className="mt-3">
            {yearCharts.map((chart, index) => (
                <div key={index} className="mb-8">
                    <HighchartsReact highcharts={Highcharts} options={chart.options} />
                </div>
            ))}
        </div>
    );
} 