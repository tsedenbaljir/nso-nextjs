import React from 'react';

export default function GlossaryFilter({ filterList, selectedFilter, handleFilterChange, t, isMn }) {
    return (
        <div className="nso_cate_section">
            <div className="__cate_groups get_space">
                <div className="__filter_sidebar_item">
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
                        {filterList.map((item) => (
                            <li
                                key={item.sector_type}
                                className={`cursor-pointer ${selectedFilter?.code === item.code ? 'active' : ''}`}
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