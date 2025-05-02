"use client";

import { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const AgePyramid = () => {
  const [yearIndex, setYearIndex] = useState(0);
  const [data, setData] = useState();
  const [chartOptions, setChartOptions] = useState();
  const [timer, setTimer] = useState(null);

  const categories = Array.from({ length: 71 }, (_, i) =>
    i < 70 ? `${i}` : "70+"
  );
  const years = [
    1963, 1969, 1979, 1989, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007,
    2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
    2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2039,
    2040, 2041, 2042, 2043, 2044, 2045,
  ];

  useEffect(() => {
    fetch("/agepiramid.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        updateChart(json.item[yearIndex], years[yearIndex]);
      });
  }, []);

  const updateChart = (jvalue, year) => {
    setChartOptions({
      chart: { type: "bar" },
      title: { text: `${year} оны хэтийн тооцоо` },
      xAxis: [
        {
          categories: categories,
          reversed: false,
          labels: { step: 5 },
        },
        {
          opposite: true,
          reversed: false,
          categories: categories,
          linkedTo: 0,
          labels: { step: 5 },
        },
      ],
      yAxis: {
        title: { text: null },
        labels: {
          formatter: function () {
            return Math.abs(this.value);
          },
        },
        max: 85000,
        min: -85000,
      },
      plotOptions: {
        series: {
          stacking: "normal",
          pointPadding: 0,
          groupPadding: 0,
          animation: { duration: 2000 },
        },
      },
      tooltip: {
        formatter: function () {
          const year = this.series.userOptions.customYear;
          return `Он: ${this.series.userOptions.customYear}<br/>
            Хүйс: ${this.series.name}<br/>
            Нас: ${this.point.category}<br/>
            Тоо: ${Highcharts.numberFormat(Math.abs(this.point.y), 0)}`;
        },
      },
      custom: {
        year: years[yearIndex],
      },
      subtitle: {
        text: "",
      },
      legend: {
        enabled: true,
      },
      exporting: {
        enabled: false,
      },
      series: [
        {
          name: "Эрэгтэй",
          color: "#2da3a3",
          data: jvalue.DataValue.TotalMan.map((v) => -v),
          customYear: year, // энэ мөр нэмнэ
        },
        {
          name: "Эмэгтэй",
          color: "#c23f6c",
          data: jvalue.DataValue.TotalWoman.map((v) => -v),
          customYear: year, // энэ мөр нэмнэ
        },
      ],
    });
  };

  const handleRangeChange = (e) => {
    const index = parseInt(e.target.value);
    setYearIndex(index);
    updateChart(data.item[index], years[index]);
  };

  const togglePlay = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    } else {
      const newTimer = setInterval(() => {
        setYearIndex((prev) => {
          const next = prev + 1 >= data.item.length ? 0 : prev + 1;
          updateChart(data.item[next], years[next]);
          return next;
        });
      }, 1500);
      setTimer(newTimer);
    }
  };

  if (!data) return <div>Уншиж байна...</div>;
  const jval = data.item[yearIndex];

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-[900px]">
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        <div className="flex justify-center items-center gap-3 my-3">
          <button
            onClick={togglePlay}
            className="bg-gray-200 hover:bg-gray-300 text-black py-1 px-3 rounded"
          >
            {timer ? "Pause" : "Play"}
          </button>
          <input
            type="range"
            min={0}
            max={data.item.length - 1}
            value={yearIndex}
            onChange={handleRangeChange}
            className="w-2/3"
          />
          <span>{years[yearIndex]} он</span>
        </div>
      </div>
      <div className="p-3 bg-white border">
        <div className="flex justify-between">
          <div className="text-center">
            <img src="/man.png" />
            <br />
            <strong>{jval.TotalMan.toLocaleString()}</strong>
          </div>
          <div className="text-center">
            <img src="/woman.png" />
            <br />
            <strong>{jval.TotalWoman.toLocaleString()}</strong>
          </div>
        </div>
        <table className="w-full text-sm mt-4 border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border">Насны бүлэг</th>
              <th className="border">Мянга.хүн</th>
              <th className="border">Хувь</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border text-center">70+</td>
              <td className="border text-right">
                {jval.OldAbs.toLocaleString()}
              </td>
              <td className="border text-right">{jval.OldPerc}%</td>
            </tr>
            <tr>
              <td className="border text-center">15–69</td>
              <td className="border text-right">
                {jval.MediumAbs.toLocaleString()}
              </td>
              <td className="border text-right">{jval.MediumPerc}%</td>
            </tr>
            <tr>
              <td className="border text-center">&lt;15</td>
              <td className="border text-right">
                {jval.YoungAbs.toLocaleString()}
              </td>
              <td className="border text-right">{jval.YoungPerc}%</td>
            </tr>
            <tr>
              <td className="border text-left">Бүгд</td>
              <td className="border text-right">
                {jval.Total.toLocaleString()}
              </td>
              <td className="border text-right">100%</td>
            </tr>
          </tbody>
        </table>
        <div className="text-sm mt-2">
          {jval.DundajNas !== -1 && (
            <div>
              Дундаж наслалт: <b>{jval.DundajNas}</b>
            </div>
          )}
          {jval.TNK !== -1 && (
            <div>
              ТНК: <b>{jval.TNK}</b>
            </div>
          )}
          <div className="text-right mt-1 text-blue-600">
            <a href="http://www.1212.mn/tables.aspx?TBL_ID=DT_NSO_0300_003V1">
              Датаг харах
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgePyramid;
