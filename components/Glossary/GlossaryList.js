import React from 'react';
import { Spin } from 'antd';
import { Paginator } from 'primereact/paginator';
import GlossaryItem from './GlossaryItem';

export default function GlossaryList({ 
    filterLoading, 
    list, 
    isMn, 
    totalRecords, 
    first, 
    rows, 
    onPageChange 
}) {
    return (
        <div className="__table_container -mt-22">
            <div className="nso_cate_body">
                <div className="nso_tab">
                    <div className="nso_tab_content">
                        {filterLoading ? (
                            <div className="flex justify-center items-center min-h-[200px]">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <div className="_group_list">
                                {list.map((item) => (
                                    <GlossaryItem 
                                        key={item.id} 
                                        item={item} 
                                        isMn={isMn} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {totalRecords > 0 && (
                <div className="card">
                    <Paginator
                        first={first}
                        rows={rows}
                        totalRecords={totalRecords}
                        onPageChange={onPageChange}
                        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                    />
                </div>
            )}
        </div>
    );
} 