'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toast } from 'primereact/toast';
import styles from './styles.module.scss';
import ClientStyles from './ClientStyles';
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { showConfirm, showToast } from '@/utils/alerts';

export default function AdminLaws() {
  const router = useRouter();
  const [laws, setLaws] = useState({
    legal: [],
    command: [],
    law: []
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const toast = useRef(null);

  const categories = [
    { label: 'Үндсэн', value: 'main' },
    { label: 'Дунд', value: 'body' }
  ];

  useEffect(() => {
    categories.forEach(category => {
      fetchLawsByType(category.value);
    });
  }, []);

  const fetchLawsByType = async (type) => {
    try {
      const response = await fetch(`/api/mainIndicators?type=${type}`);
      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        setLaws(prev => ({
          ...prev,
          [type]: result.data
        }));
      }
    } catch (error) {
      console.error('Error fetching laws:', error);
    }
  };

  const handleDelete = async (id, type) => {
    if (!id) {
      showToast(toast, 'error', 'Алдаа', 'ID олдсонгүй');
      return;
    }

    showConfirm({
      message: 'Та энэ хуулийг устгахдаа итгэлтэй байна уу?',
      header: 'Устгах',
      accept: async () => {
        try {
          const response = await fetch('/api/mainIndicators', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: parseInt(id) // Ensure ID is a number
            })
          });

          const result = await response.json();
          if (result.status) {
            await fetchLawsByType(type);
            showToast(toast, 'success', 'Амжилттай', 'Амжилттай устгагдлаа');
          } else {
            showToast(toast, 'error', 'Алдаа', result.message || 'Устгахад алдаа гарлаа');
          }
        } catch (error) {
          console.error('Error deleting law:', error);
          showToast(toast, 'error', 'Алдаа', 'Устгахад алдаа гарлаа');
        }
      }
    });
  };

  return (
    <>
      <ClientStyles />
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="w-full px-2 h-full">
        <div className={styles.adminLawsContainer}>
          <div className={styles.header}>
            <h1>Хууль эрхзүй</h1>
          </div>
          <TabView
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
            className={styles.tabView}
          >
            {categories.map((category) => (
              <TabPanel
                key={category.value}
                header={category.label}
                headerClassName={styles.tabHeader}
              >
                <div className={styles.lawsList}>
                  {Array.isArray(laws[category.value]) &&
                    laws[category.value].length > 0 ? (
                    laws[category.value].map((law) => (
                      <div key={law.id} className={styles.lawItem}>
                        {/* <h3>{law.id}</h3> */}
                        <h3>{law.name}</h3>
                        {/* <p>{law.file_info}</p> */}
                        <div className={styles.actions}>
                          {/* <button onClick={() => {}}>Засах</button> */}
                          <button onClick={() => router.push(`/admin/indicator/edit/${law.id}`)}>Засах</button>
                          <button onClick={() => handleDelete(law.id, category.value)}>
                            Устгах
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noData}>
                      No data available for {category.label}
                    </div>
                  )}
                </div>
              </TabPanel>
            ))}
          </TabView>
        </div>
      </div>
    </>
  );
} 