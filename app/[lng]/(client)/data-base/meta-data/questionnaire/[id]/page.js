"use client";
import React, { useState, useEffect } from "react";
import Text from "@/components/Loading/Text/Index";
import { useTranslation } from "@/app/i18n/client";

export default function GlossaryDetail({ params: { id, lng } }) {
  const { t } = useTranslation(lng, "lng", "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // const response = await fetch(`/api/glossary/${id}`);
      const response = await fetch(`/api/glossary/${id}?language=${lng}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const result = await response.json();
      if (result.status) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching job posting:", error);
    } finally {
      setLoading(false);
    }
  };
  const categoryOrder = [
    "Маягт",
    "Шифр",
    "Хариуцах газар/хэлтэс",
    "Статистик мэдээг хамтран гаргадаг байгууллага",
    "Мэдээ төрөл",
    "Маягт батлагдсан огноо",
    "Тушаалын дугаар",
    "Агуулга",
    "Анхан шатны мэдээлэгч",
    "Ажиглалтын хугацаа",
    "Статистик ажиглалтын төрөл",
    "Мэдээлэл цуглуулах давтамж",
    "Мэдээлэл цуглуулах хэлбэр",
    "Мэдээлэл цуглуулах ажилтан",
    "Мэдээлэл дамжуулах урсгал",
    "Мэдээлэл дамжуулах хугацаа",
    "Үр дүнг тархаах түвшин буюу үзүүлэлтийн задаргаа",
    "Ашиглагдсан ангилал, кодууд",
    "Мэдээлэл тархаах хугацаа",
    "Тооцон гаргадаг үзүүлэлтүүд",
    "Санхүүжүүлэгч байгууллага",
    "Нэмэлт мэдээлэл",
    "Түлхүүр үг",
    "Хэл",
    "Боловсруулсан мэргэжилтэн",
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
      <>
        <div className="nso_container">
          <div className="text-center text-xl">
            {lng === "mn" ? "Мэдээлэл олдсонгүй" : "Information not found"}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="__info_detail_page">
      {!loading ? (
        <div className="w-full items-center justify-between text-main">
          <div className="overflow-x-auto">
            <div className="mb-4 text-sm text-gray-800 w-[95%]">
              <h2 className="text-2xl font-bold text-main">
                {data[0]?.label}
              </h2>

              <div className="flex justify-between items-center gap-4 flex-wrap mt-2">
                <div className="flex items-center">
                  <span className="mr-2 text-gray-500">
                    <i className="pi pi-calendar-minus"></i>
                  </span>
                  <span>
                    {new Date(data[0]?.last_modified_date).toLocaleDateString("sv-SE")}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="mr-2 font-medium text-gray-400">Идэвхтэй эсэх:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm transition-all duration-300
                    ${data[0]?.active == 1
                        ? "bg-green-500 text-white border"
                        : "bg-red-100 text-red-800 border border-red-300"
                      }
                  `}
                  >
                    {data[0]?.active ? "Идэвхтэй" : "Идэвхгүй"}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="mr-2 font-medium text-gray-400">Нээлттэй эсэх:</span>
                  <span className="text-gray-700 font-medium">
                    {data[0]?.is_secret ? "Хаалттай" : "Нээлттэй"}
                  </span>
                </div>
              </div>
            </div>
            <hr className="my-4" />
            {/* Table Header */}
            <div className="flex bg-blue-50 font-semibold text-gray-700 border-gray-100 border-b py-2 text-sm">
              <div className="w-1/8 text-right px-5">No.</div>
              <div className="w-1/3 text-left px-5">Нэр</div>
              <div className="w-1/3 text-left px-5">Монгол</div>
              <div className="w-1/3 text-left px-5">Англи</div>
            </div>

            {/* Table Rows */}
            {categoryOrder.map((its, idx) => {
              return sortedData.map((item, index) => (
                <div
                  key={idx}
                  className={`flex gap-6 py-2 px-5 border-b border-gray-200 text-sm ${(sortedData.length > 2 ? index : idx) % 2 === 1 ? "bg-blue-50" : "bg-white"
                    }`}
                >
                  <div className="w-1/8 text-right text-blue-600">
                    {sortedData.length > 2 ? index + 1 : idx + 1}
                  </div>
                  <div className="w-1/3 text-left">{item.namemn ? item.namemn : its}</div>
                  <div className="w-1/3 text-left whitespace-pre-wrap">
                    {item.namemn === "Маягт батлагдсан огноо" && item.valuemn
                      ? new Date(item.valuemn).toISOString().split('T')[0]
                      : item.valuemn ? item.valuemn : ""}
                  </div>
                  <div className="w-1/3 text-left whitespace-pre-wrap">
                    {item.namemn === "Маягт батлагдсан огноо" && item.valueen
                      ? new Date(item.valueen).toISOString().split('T')[0]
                      : item.valueen ? item.valueen : ""}
                  </div>
                </div>
              ))
            })}
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
