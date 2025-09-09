import React from 'react';
import LoadingDiv from '@/components/Loading/Text/Index';

export default function GlossaryFilter({ filterList, selectedFilter, handleFilterChange, t, isMn }) {
    return (
        <div className="nso_cate_section">
            <div className="__cate_groups_lib get_space">
                <div className="__filter_sidebar_item p-0">
                    <span className="filter-title">{t('metadata.sector')}</span>
                    <ul>
                        {filterList.length === 0 ? (
                            <li className="cursor-default opacity-70">
                                <LoadingDiv />
                                <br />
                                <LoadingDiv />
                            </li>
                        ) : (
                            <>
                                <li
                                    className={`cursor-pointer ${!selectedFilter ? 'active' : ''}`}
                                    onClick={() => handleFilterChange(null)}
                                >
                                    {t('filter.all')}
                                    <span className="count font-bold">
                                        ({filterList.reduce((sum, item) => sum + (item?.count || 0), 0)})
                                    </span>
                                </li>
                                {filterList.map((item, index) => (
                                    <li
                                        key={index}
                                        className={`cursor-pointer ${selectedFilter?.id === item.id ? 'active' : ''}`}
                                        onClick={() => handleFilterChange(item)}
                                    >
                                        {isMn
                                            ? (item?.name || item?.namemn || item?.text || '')
                                            : (item?.name_eng || item?.nameen || item?.name || item?.text || '')}
                                        <span className="count font-bold">({item.count})</span>
                                    </li>
                                ))}
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
} 