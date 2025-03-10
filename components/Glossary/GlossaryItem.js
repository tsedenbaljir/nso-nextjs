import React from 'react';

export default function GlossaryItem({ item, isMn }) {
    return (
        <div className="__list">
            <div className="__table_line"></div>
            <a className="__list_header">
                {isMn ? item.name : item.name_eng}
            </a>
            {item.descriptionmn && <div className="description">
                <span className="__list_content">
                    { isMn ? item.descriptionmn : item.descriptionen }
                </span>
            </div>}
            <div className="__list_details">
                <span className="__list_date">
                    <i className="pi pi-calendar-minus"></i>
                    {item.last_modified_date && new Date(item.last_modified_date).toISOString().split('T')[0]}
                </span>
                {item.views && <span className="__list_view">
                    <img src="/images/eye.png" />{item.views || 0}
                </span>}
                {item.version &&
                <span className="__list_size">
                    <i className="pi pi-tag"></i> { item.version || 0 }
                </span>}
            </div>
        </div>
    );
} 