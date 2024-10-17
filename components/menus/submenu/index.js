import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/client';
import { useRouter, usePathname } from "next/navigation";

export default function Index({ lng }) {
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useTranslation(lng, "lng", "");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
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
        return null; // Or a loading spinner, etc.
    }
    
    return (
        <>
            <div className="__sub_header">
                <div className="nso_container">
                    <ul className="__sub_header_list">
                        {
                            menus.map((dt, index) => {
                                return <li key={index}>
                                    <a className="__stat_top_title" href={dt.link}>{dt.name}</a>
                                </li>
                            })
                        }
                        <li onClick={switchLanguage}>
                            {router.locale === 'mn' ? 'EN' : 'MN'}
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}