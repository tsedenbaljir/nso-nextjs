"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sectors_list } from './sectors';

export default function DynamicSidebar({ lng, type, sub }) {
    const router = useRouter();
    const typeId = type === undefined || type === null ? null : String(type);
    const idSet = useMemo(() => {
        const set = new Set(sectors_list.map((s) => String(s.id)));
        sectors_list.forEach((s) => (s.subFilters || []).forEach((subItem) => subItem.id != null && set.add(String(subItem.id))));
        return set;
    }, []);

    const [expanded, setExpanded] = useState(() => {
        const initial = {};
        sectors_list.forEach((s) => {
            if (s.subFilters?.length) {
                const isActive =
                    typeId === String(s.id) ||
                    s.subFilters.some(
                        (subItem) =>
                            typeId === String(subItem.id) ||
                            (subItem.years && subItem.years.includes(sub))
                    );
                if (isActive) initial[String(s.id)] = true;
            }
        });
        return initial;
    });

    useEffect(() => {
        if (typeId == null) return;
        setExpanded((prev) => {
            const next = { ...prev };
            sectors_list.forEach((s) => {
                if (!s.subFilters?.length) return;
                const isActive =
                    typeId === String(s.id) ||
                    s.subFilters.some(
                        (subItem) =>
                            typeId === String(subItem.id) ||
                            (subItem.years && subItem.years.includes(sub))
                    );
                if (isActive) next[String(s.id)] = true;
            });
            return next;
        });
    }, [typeId, sub]);

    const toggle = (sectorId) => {
        setExpanded((prev) => ({ ...prev, [String(sectorId)]: !prev[String(sectorId)] }));
    };

    const handleMainClick = (lt) => {
        router.push(`/${lng}/statistic/file-library/` + lt.id);
    };

    const handleSubClick = (e, parentId, subItem) => {
        e.stopPropagation();
        if (subItem.id != null && idSet.has(String(subItem.id))) {
            router.push(`/${lng}/statistic/file-library/` + subItem.id);
        } else {
            router.push(`/${lng}/statistic/file-library/${parentId}?sub=` + encodeURIComponent(subItem.value));
        }
    };

    return (
        <div className='__cate_groups'>
            <ul>
                {sectors_list.map((lt, index) => (
                    <li
                        key={lt.id ?? index}
                        className={`__cate_main_li ${typeId === String(lt.id) && !sub ? 'active' : ''}`}
                    >
                        <div
                            className="__cate_main nso_cate_selection min_cate border-0"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                            onClick={() => handleMainClick(lt)}
                        >
                            <a className="border-0" style={{ flex: 1 }}>
                                {lng === 'mn' ? lt.mnName : lt.enName}
                            </a>
                            {lt.subFilters?.length ? (
                                <button
                                    type="button"
                                    className="border-0 bg-transparent p-0 ms-1"
                                    style={{ cursor: 'pointer' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggle(lt.id);
                                    }}
                                    aria-expanded={expanded[String(lt.id)]}
                                >
                                    <span className="__cate_toggle" aria-hidden>
                                        {expanded[String(lt.id)] ? '▼' : '▶'}
                                    </span>
                                </button>
                            ) : null}
                        </div>
                        {lt.subFilters?.length && expanded[String(lt.id)] ? (
                            <ul className="__cate_sub_list">
                                {lt.subFilters.map((subItem, subIndex) => (
                                    <li key={subItem.id ?? subIndex} className="__cate_sub_li">
                                        {subItem.years ? (
                                            <>
                                                <div className="__cate_sub_label">
                                                    {lng === 'mn' ? subItem.mnName : subItem.enName}
                                                </div>
                                                <ul className="__cate_year_list">
                                                    {subItem.years.map((year) => {
                                                        const isYearActive = typeId === String(subItem.id) && sub === year;
                                                        return (
                                                            <li key={year} className="__cate_year_li">
                                                                <a
                                                                    className={`__cate_year_link min_cate border-0 small ${isYearActive ? 'active' : ''}`}
                                                                    onClick={(e) => handleSubClick(e, subItem.id, { value: year })}
                                                                >
                                                                    – {year}
                                                                </a>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </>
                                        ) : (
                                            <a
                                                className={`__cate_sub_link min_cate border-0 small ${typeId === String(subItem.id) ? 'active' : ''}`}
                                                onClick={(e) => handleSubClick(e, lt.id, subItem)}
                                            >
                                                – {lng === 'mn' ? subItem.mnName : subItem.enName}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </li>
                ))}
            </ul>
        </div>
    );
}
