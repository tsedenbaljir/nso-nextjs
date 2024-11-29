"use client"
import { useState } from 'react';
import MenuItems from './MenuItems';
import { SelectButton } from 'primereact/selectbutton';

export default function MenuList({ menus = [], categories = [] }) {
    const [selectedLanguage, setSelectedLanguage] = useState('MN');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const languageOptions = [
        { label: 'MN', value: 'MN' },
        { label: 'EN', value: 'EN' }
    ];

    // Get root level menus for selected category
    const rootMenus = menus.filter(menu => 
        !menu.parent_id && 
        menu.language === selectedLanguage &&
        (!selectedCategory || menu.category_id === selectedCategory)
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
                <SelectButton
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.value)}
                    options={languageOptions}
                    className="text-sm"
                />

                <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                    className="border rounded-md px-3 py-1.5"
                >
                    <option value="">Бүх ангилал</option>
                    {categories
                        .filter(cat => cat.language === selectedLanguage)
                        .map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                </select>
            </div>

            <ul className="space-y-2">
                {rootMenus.map(menu => (
                    <MenuItems
                        key={menu.id}
                        menu={menu}
                        subMenus={menus}
                        language={selectedLanguage}
                    />
                ))}
            </ul>
        </div>
    );
} 