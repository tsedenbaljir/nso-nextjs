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

    const myHeaders = new Headers();
    myHeaders.append(
        "Authorization",
        "Bearer " + process.env.BACKEND_KEY
    );

    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
    };

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const response = await fetch(`${process.env.BACKEND_URL}/api/czesnij-tohirgoos/jo702rceqsu6onv0tif6zd4v?populate[Menus][populate][populate]=*`, {
                    ...requestOptions,
                    cache: 'no-store',  // Prevents caching
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);  
                }
                const res = await response.json();

                const filteredMenus = res.data.Menus.filter(sub => sub.IsActive === true);

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
                        menus.map((dt, index) => {
                            return <li key={index} className={`${pth.includes(dt.path) && 'active-link-top'}`}>
                                <Link className="__stat_top_title text-xs font-normal" href={dt.url ? dt.url : "#"}>{lng === 'mn' ? dt.name : dt.enName}</Link>
                            </li>
                        }) : <div>
                            <OneField /><OneField /><OneField />
                        </div>
                    }
                    <li className='font-medium' onClick={switchLanguage}>
                        {lng === 'mn' ? 'EN' : 'MN'}
                    </li>
                </ul>
            </div>
        </div>
    );
}