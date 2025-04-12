"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sectors_list } from './sectors';

export default function DynamicSidebar({ lng, type }) {
    const router = useRouter();

    const [list, setList] = useState(sectors_list);

    return (
        <div className="nso_cate_section left-bar">
            <div className='__cate_groups'>
                <ul>
                    {
                        list.map((lt, index) => {
                            return <li key={index} className={`${type === lt.type && 'active'}`}
                                onClick={() => {
                                    router.push(`/${lng}/statistic/file-library/` + lt.type);
                                }}>
                                <a className="nso_cate_selection min_cate border-0">
                                    {lng === 'mn' ? lt.mnName : lt.enName}
                                </a>
                            </li>
                        })
                    }
                </ul>
            </div>
        </div>
    );
}
