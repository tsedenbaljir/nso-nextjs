import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Path } from '@/utils/path';
import { useRouter, usePathname } from "next/navigation";
import OneField from '@/components/Loading/OneField/Index';

export default function Index({ lng }) {
    var pth = Path();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const response = await fetch('/api/menus/admin');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const res = await response.json();
                const filteredMenus = res.data.filter(menu =>
                    menu.category_id === 4 &&
                    menu.is_active === true
                );
                setMenus(filteredMenus);
                setLoading(true);
            } catch (error) {
                console.error('Error fetching menus:', error);
            }
        };

        fetchMenus();
    }, []);

    const switchLanguage = () => {
        if (!mounted) return;

        // Determine the new language and path
        const currentLang = pathname.split('/')[1];
        const newLang = currentLang === 'mn' ? 'en' : 'mn';

        // Construct the new URL
        const newPathname = pathname.replace(`/${currentLang}`, `/${newLang}`);

        // Change the URL without refreshing the page
        router.push(newPathname);
    }

    if (!mounted) {
        return null;
    }

    return (
        <div className="__sub_header">
            <div className="nso_container">
                <ul className="__sub_header_list">
                    {loading ?
                        menus.map((menu, index) => (
                            <li key={index} className={`${pth.includes(menu.path) && 'active-link-top'}`}>
                                <Link
                                    className="__stat_top_title text-xs font-medium"
                                    href={menu.url || "#"}
                                >
                                    {lng === 'mn' ? menu.name_mn : menu.name_en}
                                </Link>
                            </li>
                        )) :
                        <div>
                            <OneField /><OneField /><OneField />
                        </div>
                    }
                    <li className='font-medium' onClick={switchLanguage}>
                        {lng === 'mn' ? 'EN' : 'MN'}
                    </li>
                </ul>

                <ul className="__dock_menu">
                    <li className="__dock_item">
                        <span className="dock1"></span>
                    </li>
                    <li className="__dock_item">
                        <span className="dock2"></span>
                    </li>
                    <li className="__dock_item">
                        <span className="dock3"></span>
                    </li>
                    <li className="__dock_item">
                        <a href="tel:19001212"><span className="dock4"></span></a>
                    </li>
                    <li className='font-medium' onClick={switchLanguage}>
                        {lng === 'mn' ? 'EN' : 'MN'}
                    </li>
                </ul>
            </div>
        </div>
    );
}