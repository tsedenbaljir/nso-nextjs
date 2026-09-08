"use client";

import React, { useEffect, useState } from "react";
import { Dropdown, Spin } from "antd";
import { useParams } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function parseFileInfo(raw) {
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

function normalizeFilesBundle(raw) {
  const empty = { excel: null, pdf: null, tushaal: null };
  const parsed = parseFileInfo(raw);
  if (!parsed) return empty;
  if (
    parsed.excel !== undefined ||
    parsed.pdf !== undefined ||
    parsed.tushaal !== undefined
  ) {
    return {
      excel: parsed.excel || null,
      pdf: parsed.pdf || null,
      tushaal: parsed.tushaal || null,
    };
  }
  if (parsed.pathName) return { excel: parsed, pdf: null, tushaal: null };
  return empty;
}

function isTushaalRow(item) {
  const name = String(item?.namemn || item?.field_namemn || "").trim().toLowerCase();
  return name === "тушаал" || name.includes("тушаал");
}

function formatMetaValue(value) {
  if (value && !isNaN(Date.parse(value)) && String(value).length > 8) {
    try {
      return new Date(value)?.toISOString()?.split("T")[0];
    } catch {
      return value;
    }
  }
  return value;
}

function getFileUrl(fileInfo) {
  if (!fileInfo?.pathName) return null;
  const pathName = String(fileInfo.pathName).replace(/^\/+/, "").replace(/^uploads\//, "");
  return `/uploads/${pathName}`;
}

function downloadFile(fileInfo, fallbackName) {
  const url = getFileUrl(fileInfo);
  if (!url) return;
  const link = document.createElement("a");
  link.href = url;
  link.download = fileInfo.originalName || fallbackName;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function Methodology() {
  const { methodologyId } = useParams();
  const [methodology, setMethodology] = useState(null);
  const [filesBundle, setFilesBundle] = useState({ excel: null, pdf: null, tushaal: null });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  const handleExcelDownload = () => {
    if (!methodology) return;

    const wb = XLSX.utils.book_new();
    const title = methodology.sub_Title?.[0]?.namemn || "classification";

    const generalRows = methodology.meta_data_values.map((item, i) => ({
      "№": i + 1,
      "Нэр": item.namemn,
      "Монгол": item.valuemn,
      "Англи": item.valueen,
    }));
    const ws1 = XLSX.utils.json_to_sheet(generalRows);
    ws1["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 40 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Ерөнхий мэдээлэл");

    const indicatorRows = methodology.sub_Title.map((item, i) => ({
      "№": i + 1,
      "Нэр": item.namemn,
      "Код": item.code,
      "Тодорхойлолт": item.descriptionmn?.trim(),
      "Англи нэр": item.nameen,
    }));
    const ws2 = XLSX.utils.json_to_sheet(indicatorRows);
    ws2["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 45 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Үзүүлэлтийн мэдээлэл");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), `${title}.xlsx`);
  };

  useEffect(() => {
    const fetchMethodology = async () => {
      try {
        const response = await fetch("/api/methodology/classificationDetail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: methodologyId }),
          cache: "no-store",
        });

        const data = await response.json();
        if (data.status) {
          setMethodology(data.data);
          setFilesBundle(normalizeFilesBundle(data.data.file_info));
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

  const hasPdf = Boolean(filesBundle.pdf?.pathName);
  const hasExcelFile = Boolean(filesBundle.excel?.pathName);

  // EXCEL: admin-uploaded file if present, otherwise generate table export
  const downloadExcel = () => {
    if (hasExcelFile) {
      downloadFile(filesBundle.excel, "classification.xlsx");
      return;
    }
    handleExcelDownload();
  };

  const downloadMenuItems = [
    {
      key: "pdf",
      label: "PDF",
      disabled: !hasPdf,
      icon: <i className="pi pi-file-pdf" />,
      onClick: () => {
        if (hasPdf) downloadFile(filesBundle.pdf, "classification.pdf");
      },
    },
    {
      key: "excel",
      label: "EXCEL",
      icon: <i className="pi pi-file-excel" />,
      onClick: downloadExcel,
    },
  ];

  return (
    <div className="__info_detail_page text-sm pb-10">
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
                methodology.sub_Title[0]?.active ? "bg-green-600" : "bg-red-600"
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

          <Dropdown menu={{ items: downloadMenuItems }} trigger={["click"]} placement="bottomLeft">
            <button
              type="button"
              className="__li_f_item __download_button inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-blue-400 text-blue-700 bg-blue-50 hover:bg-blue-100 transition shadow-sm"
              style={{ minWidth: "80px", justifyContent: "center" }}
            >
              <i className="pi pi-download"></i> Татах
              <i className="pi pi-chevron-down text-xs"></i>
            </button>
          </Dropdown>
        </div>
      </ul>

      <div className="__info_detail_main mt-4">
        <ul className="flex list-none border-b-0 mb-4 pl-0 font-semibold text-sm">
          <li
            className={`cursor-pointer px-4 py-2 mr-4 border border-transparent border-b-0 text-sm relative ${
              activeTab === "general" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("general")}
          >
            Ерөнхий мэдээлэл
            {activeTab === "general" && (
              <span className="absolute top-0 left-0 w-full h-1 bg-blue-600"></span>
            )}
          </li>
          <li
            className={`cursor-pointer px-4 py-2 border border-transparent border-b-0 text-sm relative ${
              activeTab === "indicators" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("indicators")}
          >
            Үзүүлэлтийн мэдээлэл
            {activeTab === "indicators" && (
              <span className="absolute top-0 left-0 w-full h-1 bg-blue-600"></span>
            )}
          </li>
        </ul>

        <div className="__metadata_tab_view">
          {activeTab === "general" && (
            <table className="min-w-full border border-gray-300 rounded-md overflow-hidden text-sm">
              <thead className="bg-[#f7fbff]">
                <tr>
                  <th style={{ width: "5%" }} className="px-2 py-1 text-left text-gray-600 rounded-tl-md">
                    #
                  </th>
                  <th style={{ width: "20%" }} className="px-6 py-1 text-left text-gray-600">
                    Нэр
                  </th>
                  <th style={{ width: "45%" }} className="px-6 py-1 text-left text-gray-600">
                    Монгол
                  </th>
                  <th style={{ width: "30%" }} className="px-6 py-1 text-left text-gray-600 rounded-tr-md">
                    Англи
                  </th>
                </tr>
              </thead>

              <tbody>
                {methodology.meta_data_values.map((item, index) => {
                  const isTushaal = isTushaalRow(item);
                  const tushaalFile = filesBundle.tushaal;
                  const tushaalUrl = isTushaal ? getFileUrl(tushaalFile) : null;
                  const nameLabel = item.namemn;
                  return (
                    <tr key={item.id ?? index} className={index % 2 === 0 ? "bg-white" : "bg-[#f7fbff]"}>
                      <td className="px-2 py-1 text-left text-blue-600">{index + 1}</td>
                      <td className="px-6 py-1">
                        {tushaalUrl ? (
                          <button
                            type="button"
                            className="text-blue-600 underline hover:text-blue-800 font-medium text-left"
                            title={tushaalFile?.originalName || "Тушаал татах"}
                            onClick={() => downloadFile(tushaalFile, "tushaal.pdf")}
                          >
                            {nameLabel}
                          </button>
                        ) : (
                          nameLabel
                        )}
                      </td>
                      <td className="px-6 py-1">{formatMetaValue(item.valuemn)}</td>
                      <td className="px-6 py-1">{formatMetaValue(item.valueen)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeTab === "indicators" && (
            <table className="min-w-full border border-gray-300 rounded-md overflow-hidden text-sm">
              <thead className="bg-[#f7fbff]">
                <tr>
                  <th style={{ width: "5%" }} className="px-2 py-1 text-left text-gray-700 rounded-tl-md">
                    #
                  </th>
                  <th style={{ width: "20%" }} className="px-6 py-1 text-left text-gray-700">
                    Нэр
                  </th>
                  <th style={{ width: "20%" }} className="px-6 py-1 text-left text-gray-700">
                    Код
                  </th>
                  <th style={{ width: "35%" }} className="px-6 py-1 text-left text-gray-700">
                    Тодорхойлолт
                  </th>
                  <th style={{ width: "20%" }} className="px-6 py-1 text-left text-gray-700 rounded-tr-md">
                    Англи нэр
                  </th>
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
        </div>
      </div>
    </div>
  );
}
