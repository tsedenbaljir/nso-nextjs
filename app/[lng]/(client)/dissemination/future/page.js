"use client";
import React, { useState, useEffect, useRef } from 'react';
import Tr from '@/components/dissemination/Tr';
import { useTranslation } from '@/app/i18n/client';
import Main from '@/components/dissemination/Main';
import Text from '@/components/Loading/Text/Index';
import "@/components/styles/dissemination-list.scss";
import { useSearchParams } from "next/navigation";
import { Dropdown } from 'primereact/dropdown';
import Pagination from '@/components/dissemination/Pagination';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';

export default function AboutUs({ params: { lng } }) {
  const { t } = useTranslation(lng, "lng", "");
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || 1, 10);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const articlesPerPage = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState();
  const [selectedMonth, setSelectedMonth] = useState();
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [orderBy, setOrderBy] = useState('updated'); // default sort

  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef(null);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value.length > 3 || value.length === 0) {
      fetchArticles(value, selectedYear, selectedMonth, orderBy);
    }
  };

  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow',
  };

  const fetchArticles = async (
    value = searchTerm,
    year = selectedYear,
    month = selectedMonth,
    order = orderBy
  ) => {
    setLoading(false);
    try {
      const url = new URL(`/api/dissemination`, window.location.origin);
      url.searchParams.set('page', page);
      url.searchParams.set('pageSize', articlesPerPage);
      url.searchParams.set('lng', lng);
      url.searchParams.set('type', 'future');
      url.searchParams.set('searchTerm', value || '');
      if (year) url.searchParams.set('year', year);
      if (month) url.searchParams.set('month', month);
      if (order) url.searchParams.set('orderBy', order);

      const response = await fetch(url, {
        ...requestOptions,
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status) {
        setArticles(result.data);
        setTotalPages(result.totalPage);

        const uniqueYears = [...new Set(result.yearsMonths.map(x => x.Year))]
          .map(y => ({ label: y, value: y }));
        const uniqueMonths = [...new Set(result.yearsMonths.map(x => x.Month))]
          .map(m => ({ label: m, value: m }));
        setYears(uniqueYears);
        setMonths(uniqueMonths);
      }
      setLoading(true);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, articlesPerPage, lng]);

  // Close sort menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSortSelect = (option) => {
    setOrderBy(option);
    setShowSortMenu(false);
    fetchArticles(searchTerm, selectedYear, selectedMonth, option);
  };

  const filterSection = (
        <div className="__filter_buttons" style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative" }}>
          <Dropdown
            value={selectedYear}
            options={years}
            onChange={(e) => {
              setSelectedYear(e.value);
              fetchArticles(searchTerm, e.value, selectedMonth, orderBy);
            }}
            placeholder={lng === "mn" ? "он" : "Year"}
            className="compact-dropdown"
            style={{ minWidth: "100px", borderRadius: "50px" }}
          />  
          <Dropdown
            value={selectedMonth}
            options={months}
            onChange={(e) => {
              setSelectedMonth(e.value);
              fetchArticles(searchTerm, selectedYear, e.value, orderBy);
            }}
            placeholder={lng === "mn" ? "сар" : "Month"}
            className="compact-dropdown"
            style={{ minWidth: "100px", borderRadius: "50px" }}
          />
    
          <div ref={sortMenuRef} style={{ position: "relative" }}>
            <button
              className="_dropbtn clicked"
              onClick={() => setShowSortMenu(!showSortMenu)}
              title={lng === "mn" ? "Эрэмбэлэх" : "Sort"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                {lng === "mn" ? "Эрэмбэлэх" : "Sort"}
              </span>
            </button>
        
            {showSortMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  right: 0,
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  zIndex: 1000,
                  minWidth: "160px",
                }}
              >
                {['updated', 'alphabet', 'views'].map((sortType) => {
                  const labels = {
                    updated: lng === "mn" ? "Эхэнд шинэчлэгдсэн" : "Updated first",
                    alphabet: lng === "mn" ? "Үсгийн дарааллаар" : "Alphabetical",
                    views: lng === "mn" ? "Хандалтын тоогоор" : "By views"
                  };
                  return (
                    <a
                      key={sortType}
                      className="filter_item"
                      style={{
                        display: "block",
                        padding: "6px 10px",
                        fontSize: "13px",
                        lineHeight: "1.3",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSortSelect(sortType)}
                    >
                      {labels[sortType]}
                    </a>
                  );
                })}
              </div>
            )}
    
          </div>
        </div>
    );


  return (
    <>
      {/* SEARCH */}
      <div className="__main_search">
        <span className="__search" style={{ border: "2px solid #005baa" }}>
          <input
            className="p-autocomplete-input p-inputtext p-component"
            placeholder={t("download.search")}
            value={searchTerm}
            style={{ border: "0" }}
            onChange={handleSearchChange}
          />
        </span>
      </div>

      <img src="/images/disimg.jpg" width="100%" />

      <Main type="future" lng={lng} filterSection={filterSection}>
        <table className="w-full">
          <thead className="p-datatable-thead">
            <tr className="__mobile_table">
              <th>{t('dissemination.scope')}</th>
              <th>{t('dissemination.specifications')}</th>
              <th>{t('dissemination.dateDistribution')}</th>
              <th>{t('dissemination.time')}</th>
            </tr>
          </thead>
          <tbody className="p-datatable-tbody">
            {loading ? (
              articles.map((dt, index) => (
                <Tr key={index} index={index} item={dt} lng={lng} />
              ))
            ) : (
              <tr><td colSpan="4"><Text /></td></tr>
            )}
          </tbody>
        </table>
        <div className="__pagination">
          <span>{lng === "mn" ? "Нийт: " : "Total: "} <strong>{totalPages}</strong></span>
          <Pagination page={page} totalPages={totalPages} mainPath="dissemination" path="future" lng={lng} articlesPerPage={articlesPerPage} />
        </div>
      </Main>
    </>
  );
}
