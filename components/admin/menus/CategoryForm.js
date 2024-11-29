"use client"
import { useState, useEffect } from 'react';
import InputItems from "@/components/admin/Edits/AddNew/InputItems";

export default function CategoryForm({
    onSubmit,
    initialData = null
}) {
    const [name, setName] = useState('');
    const [order, setOrder] = useState(0);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setOrder(initialData.list_order || 0);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            name: name,
            list_order: order
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputItems 
                name="Ангилалын нэр" 
                data={name} 
                setData={setName} 
                required 
            />

            <InputItems 
                name="Дараалал" 
                type="number"
                data={order} 
                setData={setOrder} 
            />

            <div className="flex justify-end space-x-2">
                <button
                    type="submit"
                    className="nso_btn nso_btn_primary"
                >
                    {initialData ? 'Хадгалах' : 'Нэмэх'}
                </button>
            </div>
        </form>
    );
} 