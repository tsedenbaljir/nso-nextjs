"use client"
import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { useTranslation } from '@/app/i18n/client';
import ClassificationList from '../ClassificationCode/ClassificationList';
import GlossaryFilter from '../Glossary/GlossaryFilter';

import Result from '@/components/Search/subMain/Result';
import MainSearch from '@/components/Search/subMain/MainSearch';

export default function Glossary({ params }) {
  const { lng } = params;
  const { t } = useTranslation(lng, "lng", "");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterList, setFilterList] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null);

  const isMn = lng === 'mn';

  // Fetch methodology data instead of glossary data
  useEffect(() => {
    const fetchMethodology = async () => {
      setFilterLoading(true);
      try {
        // Prepare query parameters
        const params = new URLSearchParams({
          page: Math.floor(first / rows),  // ✅ Proper pagination calculation
          pageSize: rows,
          lng: lng
        });

        if (selectedFilter?.id) {
          params.append("catalogue_id", selectedFilter.id);
        }

        const response = await fetch(`/api/methodology/classification`);
        const result = await response.json();
        
        console.log("Hi", result.data)

        if (result.status) {
          setList( result.data || []);
          setTotalRecords(result.pagination?.total || 0);
        } else {
          setList([]);
          setTotalRecords(0);
        }
      } catch (error) {
        console.error("Error fetching methodology data:", error);
        setList([]);
        setTotalRecords(0);
      } finally {
        setLoading(false)
        setFilterLoading(false);
      }
    };

    fetchMethodology();
  }, [first, rows, lng]); // ✅ `first` and `rows` are now working properly!

  // const handleFilterChange = (filter) => {
  //   setSelectedFilter(filter);
  //   setFirst(0);
  //   window.scrollTo(0, 0);
  // };

  const onPageChange = (e) => {
    setFirst(e.first);
    setRows(e.rows);
    window.scrollTo(0, 0);
  };
  useEffect(()=>{
    // console.log("filterList", filterList);
    console.log("list", list);
  },[list])

  if (loading) {
    return (
      <div className="nso_about_us mt-40">
        <div className="nso_container">
          <div className="flex justify-center items-center min-h-[400px] w-full">
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nso_container">
      <div className="sm:col-12 md:col-8 lg:col-9">
        <h2>Ангилал, код</h2>
        <ClassificationList
          filterLoading={filterLoading}
          list={list}
          isMn={isMn}
          totalRecords={totalRecords}
          first={first}
          rows={rows}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
