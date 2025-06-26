"use client";

import { useEffect, useState } from "react";
import Path from '@/components/path/Index';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/app/i18n/client';
import LoadingDiv from '@/components/Loading/OneField/Index';

export default function Statecate({ children, params }) {
    const { lng } = params;
    const pathname = usePathname();
    const [name, setName] = useState(null);
    const [title, setTitle] = useState('');
    const { t } = useTranslation(lng, "lng", "");

    useEffect(() => {
        const fetchSubcategories = async (categoryId) => {
            try {
                const response = await fetch(`/api/subsectorname?subsectorname=${categoryId}&lng=${lng}`);
                const result = await response.json();
                setName(result.data.filter(e => e.id === decodeURIComponent(pathname.split('/')[5])));

                if (!Array.isArray(result.data)) {
                    return [];
                }
            } catch (error) {
                return [];
            }
        };
        fetchSubcategories(pathname.split('/')[4]);

    }, [pathname]);


    useEffect(() => {
        async function getData() {
            const res = await fetch(`/api/table-view?lng=${lng}&sector=${pathname.split('/')[4]}&subsector=${pathname.split('/')[5]}&id=${pathname.split('/')[6]}`);
            if (res.status !== 200) {
                // throw new Error('Failed to fetch data');
                setTitle('0');
                return;
            } else {
                const json = await res.json();
                if (json?.title) {
                    setTitle(json.title);
                } else {
                    setTitle('0');
                }
            }
        }
        if (pathname.split('/')[6]) {
            getData();
        }
    }, [pathname]);

    const breadMap = pathname.includes('/report/Historical%20data') ? [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('statistic'), url: ['/statcate'] },
        { label: 'БНМАУ', url: ['/statcate/table/Historical%20data/Enterprise'] },
        { label: 'БНМАУ -ын тайлан' }
    ] : pathname.includes('/table/Historical%20data') ? [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('statistic'), url: ['/statcate'] },
        { label: 'БНМАУ', url: ['/statcate/table/Historical%20data/Enterprise'] },
        { label: name ? <div className='text-nowrap'>{name[0]?.text}</div> : <LoadingDiv /> }
    ] : pathname.includes('statcate/table/') ? [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('statistic'), url: ['/statcate'] },
        { label: t('statCate.statData'), url: ['/statcate'] },
        { label: name ? <div className='text-nowrap'>{name[0]?.text}</div> : <LoadingDiv /> }
    ] : pathname.includes('statcate/table-view/') ? [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('statistic'), url: ['/statcate'] },
        { label: t('statCate.statData'), url: ['/statcate'] },
        { label: name ? <div className='text-nowrap'>{name[0]?.text}</div> : <LoadingDiv />, url: ['/statcate/table/' + pathname.split('/')[4] + '/' + pathname.split('/')[5]] },
        { label: title ? title === '0' ? '' : title : <LoadingDiv /> }
    ] : pathname.includes('statcate') ? [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('statistic'), url: ['/statcate'] },
    ] : [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('statistic'), url: ['/statcate'] },
        { label: t('statCate.statData'), url: ['/statcate'] },
        { label: name ? <div className='text-nowrap'>{name[0]?.text}</div> : <LoadingDiv />, url: ['/statcate/table/' + pathname.split('/')[4] + '/' + pathname.split('/')[5]] },
    ];

    return (
        <div className='nso_page_wrap'>
            <Path params={params} name={t('statistic')} breadMap={breadMap} />
            {children}
        </div>
    );
}
