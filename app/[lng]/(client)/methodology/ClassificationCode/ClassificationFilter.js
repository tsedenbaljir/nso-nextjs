import React from 'react';

export default function GlossaryFilter({ filterList, selectedFilter, handleFilterChange, t, isMn }) {
    return (
        <div className="nso_cate_section">
            <div className="__cate_groups_lib get_space">
                <div className="__filter_sidebar_item p-0">
                    <span className="filter-title">{t('metadata.sector')}</span>
                    <ul>
                        <li
                            className={`cursor-pointer ${!selectedFilter ? 'active' : ''}`}
                            onClick={() => handleFilterChange(null)}
                        >
                            {t('filter.all')}
                            <span className="count font-bold">
                                ({filterList.reduce((sum, item) => sum + item.count, 0)})
                            </span>
                        </li>
                        {filterList.map((item, index) => (
                            <li
                                key={index}
                                className={`cursor-pointer ${selectedFilter?.id === item.id ? 'active' : ''}`}
                                onClick={() => handleFilterChange(item)}
                            >
                                {isMn ? item.name : item.name_eng}
                                <span className="count font-bold">({item.count})</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
} 