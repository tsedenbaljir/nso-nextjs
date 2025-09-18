"use client";
import React, { useState, useEffect } from "react";
import Text from "@/components/Loading/Text/Index";

export default function GlossaryDetail({ params: { id, lng } }) {
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
  const categoryOrderEn = [
    "Form",
    "Cipher",
    "Respondent organization",
    "Partner organization",
    "Questionnaire type",
    "Date of questionnaire cancellation",
    "Order number",
    "Content",
    "Initial informant",
    "Observation period",
    "Statistical observation type",
    "Data collection frequency",
    "Data collection form",
    "Data collection worker",
    "Data flow",
    "Data transmission time",
    "Level of dissemination of results and indicator classification",
    "Used classification, codes",
    "Data dissemination time",
    "Derived indicators",
    "Funding organization",
    "Additional information",
    "Keyword",
    "Language",
    "Processed by",
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
                {lng === "mn" ? data[0]?.label : data[0]?.label_en || data[0]?.label}
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
                  <span className="mr-2 font-medium text-gray-400">{lng === "mn" ? "Идэвхтэй эсэх:" : "Active:"}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm transition-all duration-300
                    ${data[0]?.active == 1
                        ? "bg-green-500 text-white border"
                        : "bg-red-100 text-red-800 border border-red-300"
                      }
                  `}
                  >
                    {data[0]?.active ? lng === "mn" ? "Идэвхтэй" : "Active" : lng === "mn" ? "Идэвхгүй" : "Inactive"}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="mr-2 font-medium text-gray-400">{lng === "mn" ? "Нээлттэй эсэх:" : "Open:"}</span>
                  <span className="text-gray-700 font-medium">
                    {data[0]?.is_secret ? lng === "mn" ? "Нууцлалттай" : "Secret" : lng === "mn" ? "Нээлттэй" : "Open"}
                  </span>
                </div>
              </div>
            </div>
            <hr className="my-4" />
            {/* Table Header */}
            <div className="flex bg-blue-50 font-semibold text-gray-700 border-gray-100 border-b py-2 text-sm">
              <div className="w-1/8 text-right px-5">No.</div>
              <div className="w-1/3 text-left px-5">{lng === "mn" ? "Нэр" : "Name"}</div>
              <div className="w-1/3 text-left px-5">{lng === "mn" ? "Монгол" : "Mongolian"}</div>
              <div className="w-1/3 text-left px-5">{lng === "mn" ? "Англи" : "English"}</div>
            </div>

            {/* Table Rows */}
            {sortedData.length > 1 ? sortedData.map((item, index) => (
              <div
                key={index}
                className={`flex gap-6 py-2 px-5 border-b border-gray-200 text-sm ${(sortedData.length > 2 ? index : index) % 2 === 1 ? "bg-blue-50" : "bg-white"
                  }`}
              >
                <div className="w-1/8 text-right text-blue-600">
                  {sortedData.length > 2 ? index + 1 : index + 1}
                </div>
                <div className="w-1/3 text-left">{lng === "mn" ? item.namemn : categoryOrderEn[index]}</div>
                {
                  item.namemn === "Маягт" && item.attachment_name ? (
                    <>
                      <a href={`/uploads/${item.attachment_name}`} target="_blank" className="underline cursor-pointer w-1/3 text-left whitespace-pre-wrap text-blue-400 hover:text-blue-600">
                        {item.namemn === "Маягт батлагдсан огноо" && item.valuemn && !isNaN(Date.parse(item.valuemn))
                          ? new Date(item.valuemn).toISOString().split('T')[0]
                          : item.valuemn ? item.valuemn : ""}
                      </a>
                      <a href={`/uploads/${item.attachment_name}`} target="_blank" className="underline cursor-pointer w-1/3 text-left whitespace-pre-wrap text-blue-400 hover:text-blue-600">
                        {item.namemn === "Маягт батлагдсан огноо" && item.valueen && !isNaN(Date.parse(item.valueen))
                          ? new Date(item.valueen).toISOString().split('T')[0]
                          : item.valueen ? item.valueen : ""}
                      </a>
                    </>
                  ) : item.namemn === "Мэдээ төрөл" ?
                    <>
                      <div className="w-1/3 text-left whitespace-pre-wrap">
                        {item.valuemn === "official" && "Албан ёсны статистикийн мэдээ"}
                        {item.valuemn === "administrative" && "Захиргааны мэдээ"}
                        {item.valuemn === "census" && "Тооллого"}
                        {item.valuemn === "survey" && "Судалгаа"}
                      </div>
                      <div className="w-1/3 text-left whitespace-pre-wrap">
                        {item.valuemn}
                      </div>
                    </>
                    : <>
                      <div className="w-1/3 text-left whitespace-pre-wrap">
                        {item.namemn === "Маягт батлагдсан огноо" && item.valuemn && !isNaN(Date.parse(item.valuemn))
                          ? new Date(item.valuemn).toISOString().split('T')[0]
                          : item.valuemn ? item.valuemn : ""}
                      </div>
                      <div className="w-1/3 text-left whitespace-pre-wrap">
                        {item.namemn === "Маягт батлагдсан огноо" && item.valueen && !isNaN(Date.parse(item.valueen))
                          ? new Date(item.valueen).toISOString().split('T')[0]
                          : item.valueen ? item.valueen : ""}
                      </div>
                    </>
                }
              </div>
            )) : categoryOrder.map((item, index) => (
              <div
                key={index}
                className={`flex gap-6 py-2 px-5 border-b border-gray-200 text-sm ${(sortedData.length > 2 ? index : index) % 2 === 1 ? "bg-blue-50" : "bg-white"
                  }`}
              >
                <div className="w-1/8 text-right text-blue-600">
                  {sortedData.length > 2 ? index + 1 : index + 1}
                </div>
                <div className="w-1/3 text-left">{item}</div>
                <div className="w-1/3 text-left whitespace-pre-wrap">
                </div>
                <div className="w-1/3 text-left whitespace-pre-wrap">
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <Text />
          <br />
          <Text />
        </>
      )}
    </div>
  );
}
