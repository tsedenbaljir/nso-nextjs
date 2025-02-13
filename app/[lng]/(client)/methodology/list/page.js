"use client"
import React, { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { useTranslation } from '@/app/i18n/client';
import GlossaryFilter from '../Glossary/GlossaryFilter';
import GlossaryList from '../Glossary/GlossaryList';

export default function Glossary({ params: { lng } }) {
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

  // Fetch categories and subcategories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/sectorname?lng=${lng}`);
        const result = await response.json();

        if (!result.data || !Array.isArray(result.data)) {
          console.error("Unexpected API response format:", result);
          return;
        }

        const selectedIndexes = [5, 4, 1, 3, 6, 0]; // Ordered selection
        const convert = selectedIndexes.map(index => result.data[index]).filter(Boolean);

        // Fetch subcategories
        const fetchSubcategories = async (categoryId) => {
          try {
            const response = await fetch(`/api/subsectorname?subsectorname=${decodeURIComponent(categoryId)}&lng=${lng}`);
            const result = await response.json();

            if (!Array.isArray(result.data)) {
              return [];
            }

            // Fetch counts for each item asynchronously
            const subcategoriesWithCounts = await Promise.all(
              result.data.map(async (item) => {
                try {
                  const responseCounts = await fetch(`/api/methodology?catalogue_id=${item.id}&lng=${lng}`);
                  const resultCounts = await responseCounts.json();

                  return {
                    id: item.id,
                    name: item.text,
                    count: resultCounts.data ? resultCounts.data.length : 0 // Ensure count is handled properly
                  };
                } catch (error) {
                  console.error(`Error fetching count for ${item.id}:`, error);
                  return { id: item.id, name: item.text, count: 0 };
                }
              })
            );

            // Filter out subcategories where count is 0
            return subcategoriesWithCounts.filter(item => item.count > 0);

          } catch (error) {
            console.error(`Error fetching subcategories for ${categoryId}:`, error);
            return [];
          }
        };


        // Fetch subcategories for all categories in parallel
        const menuWithSubcategories = await Promise.all(
          convert.map(async (category) => fetchSubcategories(category.id))
        );

        // Flatten and set the data
        setFilterList(menuWithSubcategories.flat());
      } catch (error) {
        console.error("Error fetching categories:", error);
        setFilterList([]); // Ensuring no undefined state
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [lng]);

  // Fetch methodology data instead of glossary data
// Fetch methodology data based on selected filter, page, and search
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

          const response = await fetch(`/api/methodology/list?${params.toString()}`);
          const result = await response.json();

          if (result.status) {
              setList(Array.isArray(result.data) ? result.data : []);
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
          setFilterLoading(false);
      }
  };

  fetchMethodology();
}, [first, rows, selectedFilter, lng]); // ✅ `first` and `rows` are now working properly!

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setFirst(0);
    window.scrollTo(0, 0);
  };

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
    <div className="nso_about_us mt-40">
      <div className="nso_container">
        <div className="sm:col-12 md:col-4 lg:col-3">
          <GlossaryFilter
            filterList={filterList}
            selectedFilter={selectedFilter}
            handleFilterChange={handleFilterChange}
            t={t}
            isMn={isMn}
          />
        </div>
        <div className="sm:col-12 md:col-8 lg:col-9">
          <GlossaryList
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
    </div>
  );
}
