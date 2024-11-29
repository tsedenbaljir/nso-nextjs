"use client"
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/layouts/AdminLayout';
import MenuList from '@/components/admin/menus/MenuList';

export default function MenuPreview() {
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/menus/admin').then(res => res.json()),
            fetch('/api/menus/categories').then(res => res.json())
        ])
        .then(([menuData, categoryData]) => {
            if (menuData.status) setMenus(menuData.data);
            if (categoryData.status) setCategories(categoryData.data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Мэдээлэл татахад алдаа гарлаа');
        })
        .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6">Цэсний харагдац</h1>
                <MenuList menus={menus} categories={categories} />
            </div>
        </AdminLayout>
    );
} 