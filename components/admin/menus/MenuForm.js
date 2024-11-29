"use client"
import { useState, useEffect } from 'react';
import { Checkbox } from 'antd';
import InputItems from "@/components/admin/Edits/AddNew/InputItems";
import SelectInput from "@/components/admin/Edits/Select/SelectInput";

export default function MenuForm({
    onSubmit,
    initialData = null,
    parentMenus = [],
    categories = [],
    isSubmenu = false
}) {
    const [nameMN, setNameMN] = useState('');
    const [nameEN, setNameEN] = useState('');
    const [parentId, setParentId] = useState(0);
    const [categoryId, setCategoryId] = useState(0);
    const [order, setOrder] = useState(0);
    const [url, setUrl] = useState('');
    const [path, setPath] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (initialData) {
            setNameMN(initialData.name_mn || '');
            setNameEN(initialData.name_en || '');
            setParentId(initialData.parent_id || 0);
            setCategoryId(initialData.category_id ? Number(initialData.category_id) : 0);
            setOrder(initialData.list_order || 0);
            setUrl(initialData.url || '');
            setPath(initialData.path || '');
            setIsActive(initialData.is_active ?? true);
        } else {
            setNameMN('');
            setNameEN('');
            setParentId(0);
            setCategoryId(0);
            setOrder(0);
            setUrl('');
            setPath('');
            setIsActive(true);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            name_mn: nameMN,
            name_en: nameEN,
            parent_id: parentId || null,
            category_id: categoryId || null,
            list_order: order,
            url,
            path,
            is_active: isActive
        });
    };

    const handleActiveChange = (checked) => {
        setIsActive(checked);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputItems 
                name="Цэсний нэр MN" 
                data={nameMN} 
                setData={setNameMN} 
                required 
            />

            <InputItems 
                name="Цэсний нэр EN" 
                data={nameEN} 
                setData={setNameEN} 
                required 
            />
            
            {!isSubmenu && (
                <>
                    <SelectInput
                        label="Ангилал"
                        value={categoryId}
                        setFields={setCategoryId}
                        data={[
                            { id: 0, name: "Ангилал сонгох" },
                            ...categories.map(cat => ({
                                id: cat.id,
                                name: cat.name_mn || cat.name
                            }))
                        ]}
                    />

                    {parentMenus.length > 0 && (
                        <SelectInput
                            label="Эцэг цэс"
                            value={parentId}
                            setFields={setParentId}
                            data={[
                                { id: 0, name: "Үндсэн цэс" },
                                ...parentMenus.map(menu => ({
                                    id: menu.id,
                                    name: menu.name_mn || menu.name
                                }))
                            ]}
                        />
                    )}
                </>
            )}

            <InputItems 
                name="URL" 
                data={url} 
                setData={setUrl} 
                placeholder="/path/to/page"
            />

            <InputItems 
                name="Path" 
                data={path} 
                setData={setPath} 
                placeholder="Enter path"
            />

            <InputItems 
                name="Дараалал" 
                type="number"
                data={order} 
                setData={setOrder} 
            />

            <div className="flex items-center">
                <Checkbox
                    checked={isActive}
                    onChange={(e) => handleActiveChange(e.target.checked)}
                >
                    Идэвхтэй
                </Checkbox>
            </div>

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