"use client"
import React, { useState, useEffect, use } from 'react';
import { Spin } from 'antd';
import ClassificationList from '../ClassificationCode/ClassificationList';

export default function Glossary(props) {
  const { lng } = use(props.params);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const isMn = lng === 'mn';

  // Fetch methodology data instead of glossary data
  useEffect(() => {
    const fetchMethodology = async () => {
      setFilterLoading(true);
      try {
        // Prepare query parameters
        const queryParams = new URLSearchParams({
          page: Math.floor(first / rows),
          pageSize: rows,
          lng: lng
        });

        const response = await fetch(`/api/methodology/classification?${queryParams.toString()}`);
        const result = await response.json();

        if (result.status) {
          setList(result.data || []);
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
  }, [first, rows, lng]);

  const onPageChange = (e) => {
    setFirst(e.first);
    setRows(e.rows);
    window.scrollTo(0, 0);
  };

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
  );
}
