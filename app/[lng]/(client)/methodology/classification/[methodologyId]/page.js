"use client";

import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import PdfViewer from "@/components/PdfViewer";
import { useParams } from "next/navigation";

export default function Methodology() {
    const { methodologyId } = useParams();
    const [methodology, setMethodology] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("general");
    const handleExcelDownload = () => {
      console.log("Excel татах товч дарлаа");
    };

    useEffect(() => {
        const fetchMethodology = async () => {
            try {
                const response = await fetch("/api/methodology/classificationDetail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: methodologyId })
                });

                const data = await response.json();
                if (data.status) {
                    setMethodology(data.data);
                    if (data.data.file_info) {
                        const fileInfo = JSON.parse(data.data.file_info);
                        setPdfUrl("https://beta.nso.mn/uploads/images/" + fileInfo.pathName);
                    }
                } else {
                    console.error("Failed to fetch methodology:", data.message);
                }
            } catch (error) {
                console.error("Error fetching methodology:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMethodology();
    }, [methodologyId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px] w-full">
                <Spin size="large" />
            </div>
        );
    }

    if (!methodology) {
        return <div className="text-sm">Мэдээлэл олдсонгүй.</div>;
    }

    console.log("methodology", methodology);

    return (
        <div className="__info_detail_page text-sm">
            <div className="__info_detail_header mb-4">
                <div className="__detail_title">
                    <h2 className="text-base font-semibold">{methodology.sub_Title[0].namemn}</h2>
                </div>
                <div className="__info_detail_desc">
                    <p>{methodology.sub_Title[0].descriptionmn}</p>
                </div>
            </div>
           <ul className="__list_info mt-2 text-sm">
              <div className="__list_item_date">

                <div className="__li_f_item">
                  <i className="__title pi pi-calendar-minus text-gray-500 mr-2"></i>
                  <span className="__title __date text-gray-700">
                    {new Date(methodology.sub_Title[0].last_modified_date).toLocaleDateString("sv-SE")}
                  </span>
                </div>

                <div className="__li_f_item">
                  <span className="__title text-gray-500">Идэвхтэй эсэх:</span>
                  <span
                    className={`__cont __is_active font-medium ml-2 text-white ${
                      methodology.sub_Title[0]?.active
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {methodology.sub_Title[0]?.active ? "Идэвхтэй" : "Идэвхгүй"}
                  </span>
                </div>

                <div className="__li_f_item">
                  <span className="__title text-gray-500">Нээлттэй эсэх:</span>
                  <span
                    className={`__cont __is_active font-medium ml-2 text-white ${
                      methodology.sub_Title[0]?.is_secret ? "bg-red-600" : "bg-green-600"
                    }`}
                  >
                    {methodology.sub_Title[0]?.is_secret ? "Хаалттай" : "Нээлттэй"}
                  </span>
                </div>

                <button
                  className="__li_f_item __download_button inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-green-400 text-green-700 bg-green-50 hover:bg-green-100 transition shadow-sm"
                  onClick={handleExcelDownload}
                  style={{ minWidth: '80px', justifyContent: 'center' }}
                >
                  <i className="pi pi-cloud-download"></i> Excel татах
                </button>
              </div>
            </ul>


            <div className="__info_detail_main mt-4">
                <ul className="flex list-none border-b-0 mb-4 pl-0 font-semibold text-sm">
                  <li
                    className={`cursor-pointer px-4 py-2 mr-4 border border-transparent border-b-0 text-sm relative ${
                      activeTab === "general"
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                    onClick={() => setActiveTab("general")}
                  >
                    Ерөнхий мэдээлэл
                    {activeTab === "general" && (
                      <span className="absolute top-0 left-0 w-full h-1 bg-blue-600"></span>
                    )}
                  </li>
                  <li
                    className={`cursor-pointer px-4 py-2 mr-4 border border-transparent border-b-0 text-sm relative ${
                      activeTab === "indicators"
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                    onClick={() => setActiveTab("indicators")}
                  >
                    Үзүүлэлтийн мэдээлэл
                    {activeTab === "indicators" && (
                      <span className="absolute top-0 left-0 w-full h-1 bg-blue-600"></span>
                    )}
                  </li>
                  <li
                    className={`cursor-pointer px-4 py-2 border border-transparent border-b-0 text-sm relative ${
                      activeTab === "classification"
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                    onClick={() => setActiveTab("classification")}
                  >
                    Ангилал, кодын мэдээлэл1231321
                    {activeTab === "classification" && (
                      <span className="absolute top-0 left-0 w-full h-1 bg-blue-600"></span>
                    )}
                  </li>
                </ul>


                <div className="__metadata_tab_view">
                    {activeTab === "general" && ( 
                      <table className="min-w-full border border-gray-300 rounded-md overflow-hidden text-sm">
                        <thead className="bg-[#f7fbff]">
                          <tr>
                            <th style={{ width: "5%" }} className="px-2 py-1 text-left text-gray-600 rounded-tl-md">#</th>
                            <th style={{ width: "20%" }} className="px-6 py-1 text-left text-gray-600">Нэр</th>
                            <th style={{ width: "45%" }} className="px-6 py-1 text-left text-gray-600">Монгол</th>
                            <th style={{ width: "30%" }} className="px-6 py-1 text-left text-gray-600 rounded-tr-md">Англи</th>
                          </tr>
                        </thead>

                        <tbody>
                          {methodology.meta_data_values.map((item, index) => (
                            <tr
                              key={item.id}
                              className={index % 2 === 0 ? "bg-white" : "bg-[#f7fbff]"}
                            >
                              <td className="px-2 py-1 text-left text-blue-600">{index + 1}</td>
                              <td className="px-6 py-1">{item.namemn}</td>
                              <td className="px-6 py-1">
                                {item.valuemn && !isNaN(Date.parse(item.valuemn))
                                  ? new Date(item.valuemn).toISOString().split('T')[0]
                                  : item.valuemn}
                              </td>
                              <td className="px-6 py-1">
                                {item.valueen && !isNaN(Date.parse(item.valueen))
                                  ? new Date(item.valueen).toISOString().split('T')[0]
                                  : item.valueen}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {activeTab === "indicators" && (
                      <table className="min-w-full border border-gray-300 rounded-md overflow-hidden text-sm">
                        <thead className="bg-[#f7fbff]">
                          <tr>
                            <th style={{ width: "5%" }} className="px-2 py-1 text-left text-gray-700 rounded-tl-md">#</th>
                            <th style={{ width: "20%" }} className="px-6 py-1 text-left text-gray-700">Нэр</th>
                            <th style={{ width: "20%" }} className="px-6 py-1 text-left text-gray-700">Код</th>
                            <th style={{ width: "35%" }} className="px-6 py-1 text-left text-gray-700">Тодорхойлолт</th>
                            <th style={{ width: "20%" }} className="px-6 py-1 text-left text-gray-700 rounded-tr-md">Англи нэр</th>
                          </tr>
                        </thead>
                        <tbody>
                          {methodology.sub_Title.map((item, index) => (
                            <tr key={item.code} className={index % 2 === 0 ? "bg-white" : "bg-[#f7fbff]"}>
                              <td className="px-2 py-1 text-left text-blue-600">{index + 1}</td>
                              <td className="px-6 py-1">{item.namemn}</td>
                              <td className="px-6 py-1">{item.code}</td>
                              <td className="px-6 py-1">{item.descriptionmn?.trim()}</td>
                              <td className="px-6 py-1">{item.nameen}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {activeTab === "classification" && (
                      <table className="min-w-full border border-gray-300 rounded-md overflow-hidden text-sm">
                        <thead className="bg-[#f7fbff]">
                          <tr>
                            <th style={{ width: "5%" }} className="px-2 py-1 text-left text-gray-700 rounded-tl-md">#</th>
                            <th style={{ width: "30%" }} className="px-6 py-1 text-left text-gray-700">Нэр</th>
                            <th style={{ width: "30%" }} className="px-6 py-1 text-left text-gray-700">Код</th>
                            <th style={{ width: "35%" }} className="px-6 py-1 text-left text-gray-700 rounded-tr-md">Англи нэр</th>
                          </tr>
                        </thead>
                        <tbody>
                          {methodology.sub_classifications.map((item, index) => (
                            <tr
                              key={item.id}
                              className={index % 2 === 0 ? "bg-white" : "bg-[#f7fbff]"}
                            >
                              <td className="px-2 py-1 text-left text-blue-600">{index + 1}</td>
                              <td className="px-6 py-1">{item.namemn}</td>
                              <td className="px-6 py-1">{item.code}</td>
                              <td className="px-6 py-1">{item.nameen}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                </div>

            </div>
        </div>
    );
}
