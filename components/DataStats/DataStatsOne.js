"use client"
import React, { useEffect, useState } from "react";

const DataStatsOne = () => {
  const [stats, setStats] = useState({
    disseminations: 0,
    news: 0,
    menus: 0,
    glossary: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [disseminationsRes, newsRes, menusRes, glossaryRes] = await Promise.all([
          fetch('/api/disseminations/count'),
          fetch('/api/news/count'),
          fetch('/api/menus/count'),
          fetch('/api/glossary/count')
        ]);

        const disseminationsCount = await disseminationsRes.json();
        const newsCount = await newsRes.json();
        const menusCount = await menusRes.json();
        const glossaryCount = await glossaryRes.json();

        setStats({
          disseminations: disseminationsCount,
          news: newsCount,
          menus: menusCount,
          glossary: glossaryCount
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const dataStatsList = [
    {
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.5 3.25H6.5C4.429 3.25 2.75 4.929 2.75 7V19C2.75 21.071 4.429 22.75 6.5 22.75H19.5C21.571 22.75 23.25 21.071 23.25 19V7C23.25 4.929 21.571 3.25 19.5 3.25ZM7.583 11.917H9.75V18.417H7.583V11.917ZM11.917 7.583H14.083V18.417H11.917V7.583ZM16.25 14.083H18.417V18.417H16.25V14.083Z"
            fill="white"
          />
        </svg>
      ),
      color: "#3FD97F",
      title: "Тархаах хуваарь",
      value: stats.disseminations.toString(),
      growthRate: 0,
    },
    {
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21.667 4.333H4.333C3.047 4.333 2 5.38 2 6.667V19.333C2 20.62 3.047 21.667 4.333 21.667H21.667C22.953 21.667 24 20.62 24 19.333V6.667C24 5.38 22.953 4.333 21.667 4.333ZM21.667 19.333H4.333V6.667H21.667V19.333ZM11.667 17.167H19.5V15H11.667V17.167ZM6.5 17.167H9.5V15H6.5V17.167ZM11.667 13.833H19.5V11.667H11.667V13.833ZM6.5 13.833H9.5V11.667H6.5V13.833ZM11.667 10.5H19.5V8.333H11.667V10.5ZM6.5 10.5H9.5V8.333H6.5V10.5Z"
            fill="white"
          />
        </svg>
      ),
      color: "#FF9C55",
      title: "Мэдээ мэдээлэл",
      value: stats.news.toString(),
      growthRate: 0,
    },
    {
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.333 6.5H21.667V8.667H4.333V6.5ZM4.333 11.917H21.667V14.083H4.333V11.917ZM4.333 17.333H21.667V19.5H4.333V17.333Z"
            fill="white"
          />
        </svg>
      ),
      color: "#8155FF",
      title: "Цэснүүд",
      value: stats.menus.toString(),
      growthRate: 0,
    },
    {
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 5.5H5C3.89543 5.5 3 6.39543 3 7.5V18.5C3 19.6046 3.89543 20.5 5 20.5H21C22.1046 20.5 23 19.6046 23 18.5V7.5C23 6.39543 22.1046 5.5 21 5.5Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 13H18M8 16H14"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "#FF6B6B",
      title: "Нэр, томьёоны тайлбар",
      value: stats.glossary.toString(),
      growthRate: 0,
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {dataStatsList.map((item, index) => (
          <div
            key={index}
            className="rounded-[10px] p-4 shadow-1 dark:bg-gray-dark w-1/5"
          >
            <div
              className="flex h-14.5 w-14.5 items-center justify-center rounded-full mb-2"
              style={{ backgroundColor: item.color }}
            >
              {item.icon}
            </div>
            <span className="text-xl font-medium dark:text-white whitespace-nowrap text-gray-6">{item.title}</span>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <h4 className="mb-1.5 text-heading-6 font-bold text-dark dark:text-white">
                  Нийт: {item.value}
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DataStatsOne;