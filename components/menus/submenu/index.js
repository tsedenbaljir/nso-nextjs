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
        "Bearer 82d1546606040d636ba3984d107e0e7b943b5b7484889d95216ae6709556c7201f0c1d3b74119ce25f025143e4f904aaf33943021f659db9c664c96b15bcf75825a79c7c4bed30cd69fa7a7818e781043e458c62ced21b433b0662ac4ea7159ddfd475d6cd36d30e176f028ca02f386d0ad2568a76a84dfd52911f615aba6b28"
    );

    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
    };

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const response = await fetch(`https://medee.nso.mn/api/czesnij-tohirgoos/jo702rceqsu6onv0tif6zd4v?populate[Menus][populate][populate]=*`, {
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