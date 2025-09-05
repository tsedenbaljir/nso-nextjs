import { Spin } from "antd";
import { Paginator } from "primereact/paginator";
import GlossaryItem from "./GlossaryItem";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
export default function GlossaryList({
  filterLoading,
  list,
  isMn,
  totalRecords,
  first,
  rows,
  onPageChange,
  path,
  lng,
}) {
  const [sortType, setSortType] = useState(lng === "mn" ? "Эхэнд шинэчлэгдсэн" : "Updated first");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDownloadExcel = () => {
    const exportData = list.map((item) => {
      let fileInfo = item.file_info;
      if (typeof fileInfo === "string") {
        try {
          fileInfo = JSON.parse(fileInfo);
        } catch (e) {
          fileInfo = {};
        }
      }
      return {
        Гарчиг: item.name || "",
        Тайлбар: item.info || "",
        Огноо: item.published_date
          ? new Date(item.published_date).toISOString().split("T")[0]
          : "",
        Хандалт: item.views ?? 0,
        Төрөл: fileInfo?.extension?.toUpperCase() || "N/A",
        Хэмжээ_MB: item.file_size
          ? (item.file_size / 1024 / 1024).toFixed(2)
          : "0.00",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "questionnaire_list.xlsx");
  };

  const getSortedList = () => {
    const sorted = [...list];
    if (sortType === (lng === "mn" ? "Эхэнд шинэчлэгдсэн" : "Updated first")) {
      sorted.sort(
        (a, b) => new Date(b.published_date) - new Date(a.published_date)
      );
    } else if (sortType === (lng === "mn" ? "Үсгийн дарааллаар" : "Alphabetical order")) {
      sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortType === (lng === "mn" ? "Хандалтын тоогоор" : "Views order")) {
      sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    return sorted;
  };
  return (
    <div className="__table_container -mt-20">
      <div className="nso_cate_body">
        <div className="nso_tab">
          <div className="nso_tab_content w-[100%]">
            <div className="__table_container pt-6">
              <div className="_filter_side ">
                <button
                  className="__download_button whitespace-nowrap text-sm"
                  onClick={handleDownloadExcel}
                >
                  <i className="pi pi-cloud-download"></i> {lng === "mn" ? "Excel татах" : "Download Excel"}
                </button>

                {/* Sort Dropdown */}
                <div className="__dropdown">
                  <button
                    className="_dropbtn"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <img src="/images/filter.png" className="filter " />
                    {lng === "mn" ? "Эрэмбэлэх" : "Sort"}
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white border rounded shadow-md z-10">
                      {[
                        lng === "mn" ? "Эхэнд шинэчлэгдсэн" : "Updated first",
                        lng === "mn" ? "Үсгийн дарааллаар" : "Alphabetical order",
                        lng === "mn" ? "Хандалтын тоогоор" : "Views order",
                      ].map((type) => (
                        <div
                          key={type}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                            sortType === type
                              ? "bg-gray-800 text-white font-semibold flex justify-between items-center"
                              : ""
                          }`}
                          onClick={() => {
                            setSortType(type);
                            setDropdownOpen(false);
                          }}
                        >
                          {type}
                          {sortType === type && <span className="ml-2">↓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {filterLoading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <Spin size="large" />
                </div>
              ) : (
                <div className="pt-6">
                  <div className="_group_list">
                    {getSortedList().map((item) => (
                      <GlossaryItem
                        key={item.id}
                        path={path}
                        item={item}
                        isMn={isMn}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {totalRecords > 0 && (
          <div className="card mt-6">
            <Paginator
              first={first}
              rows={rows}
              totalRecords={totalRecords}
              onPageChange={onPageChange}
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            />
          </div>
        )}
      </div>
    </div>
  );
}
