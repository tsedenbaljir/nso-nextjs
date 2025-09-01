"use client";
import React, { useState, useEffect } from "react";
import Text from "@/components/Loading/Text/Index";

export default function GlossaryDetail({ params: { id, lng } }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const response = await fetch(`/api/glossary/${id}`);
        const response = await fetch(`/api/indicator/${id}?language=${lng}`);
        if (!response.ok) throw new Error("Failed to fetch");

        const result = await response.json();
        console.log(result);
        
        if (result.status) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Error fetching job posting:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const categoryOrder = [
    "Салбар",
    "Дэд салбар",
    "Тодорхойлолт",
    "Аргачлал, арга зүйн нэр",
    "Тооцох аргачлал",
    "Тооцож эхэлсэн хугацаа",
    "Үзүүлэлтийг тооцох давтамж",
    "Хэмжих нэгж",
    "Эх үүсвэр",
    " Хэл",
    "Боловсруулсан мэргэжилтэн",
    "Сүүлд өөрчлөгдсөн огноо",
    "Хариуцагч",
  ];

  // Assuming `data` contains an array of items with `namemn`, `valuemn`, and `valueen`
  const sortedData = data?.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a.namemn);
    const indexB = categoryOrder.indexOf(b.namemn);

    // Handle the case where a category might not exist in the order
    const positionA = indexA === -1 ? Infinity : indexA; // Place unknown categories at the end
    const positionB = indexB === -1 ? Infinity : indexB; // Same for b

    return positionA - positionB; // Sort based on the predefined order
  });

  if (!data && !loading) {
    return (
      <div className="nso_container">
        <div className="text-center text-xl">
          {lng === "mn" ? "Мэдээлэл олдсонгүй" : "Information not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="__info_detail_page">
      {!loading ? (
        <div className="w-full items-center justify-between text-main">
          <div className="overflow-x-auto">
            <div className="mb-4 text-sm text-gray-700">
              <h2 className="text-xl font-bold text-main mr-4">
                {data[0]?.labelmn}
              </h2>

              {/* Тодорхойлолт элемент харуулах */}
              {sortedData.some((item) => item.namemn === "Тодорхойлолт") && (
                <div className="mt-2">
                  <div className="mt-2">
                    {sortedData
                      .filter((item) => item.namemn === "Тодорхойлолт")
                      .map((item, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {item.valuemn || item.valueen}
                        </p>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center gap-4 flex-wrap mt-2">
                <div className="flex items-center">
                  <span className="mr-2 text-gray-500">
                    <i className="pi pi-calendar-minus"></i>
                  </span>
                  <span>
                    {new Date(data[0]?.last_modified_date).toLocaleDateString(
                      "sv-SE"
                    )}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="mr-2 font-medium text-gray-400">
                    Идэвхтэй эсэх:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm transition-all duration-300
                        ${data[0]?.active == 1
                        ? "bg-green-500 text-white border"
                        : "bg-red-100 text-red-800 border border-red-300"
                      }`}
                  >
                    {data[0]?.active ? "Идэвхтэй" : "Идэвхгүй"}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="mr-2 font-medium text-gray-400">
                    Нээлттэй эсэх:
                  </span>
                  <span className="text-gray-700 font-medium">
                    {data[0]?.is_secret ? "Хаалттай" : "Нээлттэй"}
                  </span>
                </div>
              </div>
            </div>
            <hr className="my-4" />

            {/* Table Header */}
            <div className="flex bg-blue-50 font-semibold text-gray-700 border-gray-100 border-b py-2 text-sm">
              <div className="w-1/8 text-left px-4">No.</div>
              <div className="w-1/3 text-left px-4">Нэр</div>
              <div className="w-1/3 text-left px-4">Монгол</div>
              <div className="w-1/3 text-left px-4">Англи</div>
            </div>

            {/* Table Rows */}
            {sortedData.map((item, index) => (
              <div
                key={index}
                className={`flex gap-6 py-2 px-5 border-b border-gray-200 text-sm ${index % 2 === 1 ? "bg-blue-50" : "bg-white"
                  }`}
              >
                <div className="w-1/8 text-left text-blue-600">{index + 1}</div>
                <div className="w-1/3 text-left">{categoryOrder[index]}</div>
                <div className="w-1/3 text-left whitespace-pre-wrap">
                  {(item.namemn === "Тооцож эхэлсэн хугацаа" ||
                    item.namemn === "Сүүлд өөрчлөгдсөн огноо") &&
                    item.valuemn
                    ? new Date(item.valuemn).toISOString().split("T")[0]
                    : item.valuemn}
                </div>
                <div className="w-1/3 text-left whitespace-pre-wrap">
                  {(item.namemn === "Тооцож эхэлсэн хугацаа" ||
                    item.namemn === "Сүүлд өөрчлөгдсөн огноо") &&
                    item.valueen
                    ? new Date(item.valueen).toISOString().split("T")[0]
                    : item.valueen}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <Text />
          <Text />
        </>
      )}
    </div>
  );
}
