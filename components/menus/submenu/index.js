import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from "next/navigation";
// import { useTranslation } from '@/app/i18n/client';

export default function Index({ lng }) {
    // const { t } = useTranslation(lng, "header", "");
    const router = useRouter();
    const pathname = usePathname();
    // const { pathname, asPath, query } = router;
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
                        <li>
                            <a className="__stat_top_title">Тархаах хуваарь</a>
                        </li>
                        <li>
                            <a className="__stat_top_title">Ил тод байдал</a>
                        </li>
                        <li>
                            <a className="__stat_top_title">Шилэн данс</a>
                        </li>
                        <li>
                            <a className="__stat_top_title">Холбоо барих</a>
                        </li>
                        <li>
                            <a className="__stat_top_title">Хуучин хувилбар</a>
                        </li>
                        <li onClick={switchLanguage}>
                            {router.locale === 'mn' ? 'EN' : 'MN'}
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}