'use client';
import { useEffect, useState, useRef } from 'react';
import styles from './styles.module.scss';
import { TabView, TabPanel } from 'primereact/tabview';
import ClientStyles from './ClientStyles';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { showConfirm, showToast } from '@/utils/alerts';

export default function AdminLaws() {
  const [laws, setLaws] = useState({
    legal: [],
    command: [],
    law: []
  });
  const [editingLaw, setEditingLaw] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newLaw, setNewLaw] = useState({
    name: '',
    file_type: '',
    description: '',
    file: null
  });
  const toast = useRef(null);

  const categories = [
    { label: 'Хууль', value: 'legal' },
    { label: 'Дүрэм журам', value: 'rules' },
    { label: 'Тушаал', value: 'command' },
    { label: 'Баримт бичиг', value: 'documents' }
  ];

  useEffect(() => {
    // Fetch all types at once when component mounts
    categories.forEach(category => {
      fetchLawsByType(category.value);
    });
  }, []);

  const fetchLawsByType = async (type) => {
    try {
      const response = await fetch(`/api/laws?type=${type}`, {
        cache: 'no-store'
    });
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

  const handleEdit = (law) => {
    setEditingLaw({
      id: law.id,
      name: law.name,
      description: law.file_description,
      file_type: law.file_type
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/laws', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingLaw),
        cache: 'no-store'
      });

      const result = await response.json();
      if (result.status) {
        setIsEditing(false);
        setEditingLaw(null);
        fetchLawsByType(editingLaw.file_type);
        alert('Law updated successfully');
      } else {
        alert(result.message || 'Failed to update law');
      }
    } catch (error) {
      console.error('Error updating law:', error);
      alert('Error updating law');
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
          const response = await fetch('/api/laws', {
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

  const handleAdd = () => {
    setIsAdding(true);
  };

  const handleFileUpload = (event) => {
    const file = event.files[0];
    setNewLaw(prev => ({
      ...prev,
      file: file
    }));
  };

  const handleSubmitNew = async (e) => {
    e.preventDefault();

    if (!newLaw.file) {
      alert('Please select a file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newLaw.name);
      formData.append('file_type', newLaw.file_type);
      formData.append('description', newLaw.description);
      formData.append('file', newLaw.file);

      const response = await fetch('/api/laws', {
        method: 'POST',
        body: formData,
        cache: 'no-store'
      });

      const result = await response.json();
      if (result.status) {
        setIsAdding(false);
        setNewLaw({
          name: '',
          file_type: '',
          description: '',
          file: null
        });
        fetchLawsByType(newLaw.file_type);
        alert('Law added successfully');
      } else {
        alert(result.message || 'Failed to add law');
      }
    } catch (error) {
      console.error('Error adding law:', error);
      alert('Error adding law');
    }
  };

  return (
    <>
      <ClientStyles />
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="w-full px-2 h-full">
        <div className={styles.adminLawsContainer}>
          {isAdding ? (
            <div className={styles.addForm}>
              <h2>Хууль эрхзүй нэмэх</h2>
              <form onSubmit={handleSubmitNew}>
                <div>
                  <label>Нэр:</label>
                  <input
                    type="text"
                    value={newLaw.name}
                    onChange={(e) => setNewLaw({ ...newLaw, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Төрөл:</label>
                  <select
                    value={newLaw.file_type}
                    onChange={(e) => setNewLaw({ ...newLaw, file_type: e.target.value })}
                    required
                  >
                    <option value="">Сонгоно уу</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Тайлбар:</label>
                  <textarea
                    value={newLaw.description}
                    onChange={(e) => setNewLaw({ ...newLaw, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Файл:</label>
                  <FileUpload
                    mode="basic"
                    name="file"
                    accept="application/pdf"
                    maxFileSize={10000000}
                    onSelect={handleFileUpload}
                    auto
                    chooseLabel="Choose PDF"
                  />
                </div>
                <div className={styles.formActions}>
                  <button type="submit">Хадгалах</button>
                  <button type="button" onClick={() => setIsAdding(false)}>Болих</button>
                </div>
              </form>
            </div>
          ) : isEditing && editingLaw ? (
            <div className={styles.addForm}>
              <h2>Хууль эрхзүй засварлах</h2>
              <form onSubmit={handleUpdate}>
                <div>
                  <label>Нэр:</label>
                  <input
                    type="text"
                    value={editingLaw.name}
                    onChange={(e) => setEditingLaw({ ...editingLaw, Нэр: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Төрөл:</label>
                  <select
                    value={editingLaw.file_type}
                    onChange={(e) => setEditingLaw({ ...editingLaw, file_type: e.target.value })}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Тайлбар:</label>
                  <textarea
                    value={editingLaw.description}
                    onChange={(e) => setEditingLaw({ ...editingLaw, description: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formActions}>
                  <button type="submit">Хадгалах</button>
                  <button type="button" onClick={() => setIsEditing(false)}>Болих</button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className={styles.header}>
                <h1>Хууль эрхзүй</h1>
                <button onClick={handleAdd} className={styles.addButton}>
                  Шинээр нэмэх
                </button>
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
                            <h3>{law.name}</h3>
                            {/* <p>{law.file_info}</p> */}
                            <div className={styles.actions}>
                              <button onClick={() => handleEdit(law)}>Засах</button>
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
            </>
          )}
        </div>
      </div>
    </>
  );
} 