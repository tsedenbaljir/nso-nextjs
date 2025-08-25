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

        // Preserve search parameters (query string)
        const searchParams = window.location.search;
        const newUrl = searchParams ? `${newPathname}${searchParams}` : newPathname;

        // Change the URL without refreshing the page
        router.push(newUrl);
    }

    if (!mounted) {
        return null;
    }

    return (
        <div className="__sub_header">
            <div className="nso_container">
                <ul className="__sub_header_list">
                    {loading ?
                        menus.map((menu, index) => {
                            if (pth.includes("/about-us/news/")) {
                                return <li key={index} className={`${menu.name_mn.includes("Үйл явдал") && 'active-link-top'}`}>
                                    <Link
                                        className="__stat_top_title text-xs font-medium"
                                        target={menu.url.includes('https://') ? '_blank' : '_self'}
                                        href={menu.url.includes('https://') ? menu.url : `/${lng}/${menu.url}` || "#"}
                                    >
                                        {lng === 'mn' ? menu.name_mn : menu.name_en}
                                    </Link>
                                </li>
                            } else {
                                return <li key={index} className={`${pth.includes(menu.path) && 'active-link-top'}`}>
                                    <Link
                                        className="__stat_top_title text-xs font-medium"
                                        target={menu.url.includes('https://') ? '_blank' : '_self'}
                                        href={menu.url.includes('https://') ? menu.url : `/${lng}/${menu.url}` || "#"}
                                    >
                                        {lng === 'mn' ? menu.name_mn : menu.name_en}
                                    </Link>
                                </li>
                            }
                        }) :
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