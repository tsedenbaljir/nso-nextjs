"use client"
import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import Path from '@/components/path/Index';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';
import GlossaryFilter from './Glossary/GlossaryFilter';

export default function Layout({ children, params: { lng } }) {
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
  const pathname = usePathname();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/sectorname?lng=${lng}`);
        const result = await response.json();

        if (!result.data || !Array.isArray(result.data)) {
          console.error("Unexpected API response format:", result);
          return;
        }

        const selectedIndexes = [5, 4, 1, 3, 6, 0, 2, 7]; // Ordered selection
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
                  const responseCounts = await fetch(`/api/methodology/listDetail?catalogue_id=${item.id}&lng=${lng}`);
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

  const breadMap = [
    { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
    { label: t('statCate.methodologyText'), url: [lng === 'mn' ? '/mn/methodology/list' : '/en/methodology/list'] }
  ];

  return (
    <div className="nso_page_wrap">
      <Path name={t('statCate.methodologyText')} breadMap={breadMap} />
      <div className="nso_container mt-4">
        <div className="sm:col-12 md:col-4 lg:col-3">
          <Sidebar lng={lng} />
          <div className="sm:col-0 md:col-0 lg:col-0">
            {!pathname.includes('classification') && <GlossaryFilter
              filterList={filterList}
              selectedFilter={selectedFilter}
              handleFilterChange={handleFilterChange}
              t={t}
              isMn={isMn}
            />}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
