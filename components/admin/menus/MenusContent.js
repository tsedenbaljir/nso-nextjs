"use client"
import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';

import MenuTable from './MenuTable';
import MenuForm from './MenuForm';
import CategoryTable from './CategoryTable';
import CategoryForm from './CategoryForm';

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function MenusContent() {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [parentId, setParentId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [showCategoryDialog, setShowCategoryDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        fetchMenus();
        fetchCategories();
    }, []);

    const fetchMenus = async () => {
        try {
            const response = await fetch('/api/menus/admin');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            if (data.status) {
                setMenus(data.data);
            }
        } catch (error) {
            alert('Цэс татахад алдаа гарлаа');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/menus/categories');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            if (data.status) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            alert('Ангилал татахад алдаа гарлаа');
        }
    };

    const handleMenuSubmit = async (formData) => {
        try {
            const url = editingMenu ? 
                `/api/menus/admin/${editingMenu.id}` : 
                '/api/menus/admin';

            const method = editingMenu ? 'PUT' : 'POST';

            if (parentId && !editingMenu) {
                formData.parent_id = parentId;
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error('Failed to save');
            }
            
            const data = await response.json();
            if (data.status) {
                alert(editingMenu ? 'Цэс амжилттай засагдлаа' : 'Цэс амжилттай нэмэгдлээ');
                setShowDialog(false);
                fetchMenus();
                setEditingMenu(null);
                setParentId(null);
            }
        } catch (error) {
            alert('Цэс хадгалахад алдаа гарлаа');
        }
    };

    const handleCategorySubmit = async (formData) => {
        try {
            const url = editingCategory ? 
                `/api/menus/categories/${editingCategory.id}` : 
                '/api/menus/categories';

            const method = editingCategory ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save');
            
            const data = await response.json();
            if (data.status) {
                alert(editingCategory ? 'Ангилал амжилттай засагдлаа' : 'Ангилал амжилттай нэмэгдлээ');
                setShowCategoryDialog(false);
                fetchCategories();
                setEditingCategory(null);
            }
        } catch (error) {
            alert('Ангилал хадгалахад алдаа гарлаа');
        }
    };

    const handleDeleteMenu = async (id) => {
        confirmDialog({
            message: 'Энэ цэсийг устгахдаа итгэлтэй байна уу?',
            header: 'Устгах',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Тийм',
            rejectLabel: 'Үгүй',
            accept: async () => {
                try {
                    const response = await fetch(`/api/menus/admin/${id}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to delete');
                    }
                    
                    const data = await response.json();
                    
                    if (data.status) {
                        alert('Цэс амжилттай устгагдлаа');
                        await fetchMenus();  // Refresh the menu list
                    } else {
                        throw new Error(data.message || 'Failed to delete menu');
                    }
                } catch (error) {
                    console.error('Error deleting menu:', error);
                    alert(`Цэс устгахад алдаа гарлаа: ${error.message}`);
                }
            }
        });
    };

    const handleDeleteCategory = async (id) => {
        confirmDialog({
            message: 'Энэ ангилалыг устгахдаа итгэлтэй байна уу?',
            header: 'Устгах',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Тийм',
            rejectLabel: 'Үгүй',
            accept: async () => {
                try {
                    const response = await fetch(`/api/menus/categories/${id}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) throw new Error('Failed to delete');
                    
                    const data = await response.json();
                    if (data.status) {
                        alert('Ангилал амжилттай устгагдлаа');
                        fetchCategories();
                    }
                } catch (error) {
                    console.error('Error deleting category:', error);
                    alert('Ангилал устгахад алдаа гарлаа');
                }
            }
        });
    };

    return (
        <div className="w-full card">
            <ConfirmDialog />
            
            <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                <TabPanel header="Ангиал">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold ml-5">Ангилал</h1>
                        <button
                            onClick={() => {
                                setEditingCategory(null);
                                setShowCategoryDialog(true);
                            }}
                            className="nso_btn nso_btn_primary"
                        >
                            Шинэ ангилал нэмэх
                        </button>
                    </div>

                    <CategoryTable 
                        data={categories}
                        loading={loading}
                        onEdit={(id) => {
                            const category = categories.find(c => c.id === id);
                            if (category) {
                                setEditingCategory(category);
                                setShowCategoryDialog(true);
                            }
                        }}
                        onDelete={handleDeleteCategory}
                    />
                </TabPanel>

                <TabPanel header="Цэс">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">Цэс</h1>
                        <button
                            onClick={() => {
                                setEditingMenu(null);
                                setParentId(null);
                                setShowDialog(true);
                            }}
                            className="nso_btn nso_btn_primary"
                        >
                            Шинэ цэс нэмэх
                        </button>
                    </div>

                    <MenuTable 
                        data={menus}
                        loading={loading}
                        onEdit={(id) => {
                            const menu = menus.find(m => m.id === id);
                            if (menu) {
                                setEditingMenu(menu);
                                setShowDialog(true);
                            }
                        }}
                        onDelete={handleDeleteMenu}
                        onAddSubmenu={(id) => {
                            setParentId(id);
                            setEditingMenu(null);
                            setShowDialog(true);
                        }}
                        categories={categories}
                    />
                </TabPanel>
            </TabView>

            <Dialog
                header={editingMenu ? "Цэс засах" : "Шинэ цэс нэмэх"}
                visible={showDialog}
                style={{ width: '50vw' }}
                onHide={() => {
                    setShowDialog(false);
                    setEditingMenu(null);
                    setParentId(null);
                }}
                className="p-dialog-custom"
            >
                <MenuForm
                    onSubmit={handleMenuSubmit}
                    initialData={editingMenu}
                    parentMenus={menus.filter(m => m.is_active && m.category_id === 2)}
                    categories={categories}
                    isSubmenu={!!parentId}
                />
            </Dialog>

            <Dialog
                header={editingCategory ? "Ангилал засах" : "Шинэ ангилал нэмэх"}
                visible={showCategoryDialog}
                style={{ width: '50vw' }}
                onHide={() => {
                    setShowCategoryDialog(false);
                    setEditingCategory(null);
                }}
                className="p-dialog-custom"
            >
                <CategoryForm
                    onSubmit={handleCategorySubmit}
                    initialData={editingCategory}
                />
            </Dialog>
        </div>
    );
} 