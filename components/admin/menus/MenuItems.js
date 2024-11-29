"use client"
import { useState } from 'react';
import Link from 'next/link';

export default function MenuItems({ 
    menu, 
    subMenus = [], 
    isChild = false,
    language = 'MN'
}) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = subMenus.some(sub => sub.parent_id === menu.id);

    const toggleSubmenu = (e) => {
        e.preventDefault();
        setIsOpen(!isOpen);
    };

    return (
        <li className={`relative ${isChild ? 'ml-4' : ''}`}>
            <div className="flex items-center">
                {hasChildren && (
                    <button
                        onClick={toggleSubmenu}
                        className="p-1 hover:bg-gray-100 rounded-full mr-2"
                    >
                        <i className={`pi ${isOpen ? 'pi-chevron-down' : 'pi-chevron-right'}`}></i>
                    </button>
                )}
                <Link 
                    href={menu.url || '#'} 
                    className="py-2 px-4 hover:bg-gray-50 rounded-md block w-full"
                >
                    {menu.name}
                </Link>
            </div>

            {hasChildren && isOpen && (
                <ul className="mt-1">
                    {subMenus
                        .filter(sub => sub.parent_id === menu.id && sub.language === language)
                        .map(subMenu => (
                            <MenuItems
                                key={subMenu.id}
                                menu={subMenu}
                                subMenus={subMenus}
                                isChild={true}
                                language={language}
                            />
                        ))}
                </ul>
            )}
        </li>
    );
} 