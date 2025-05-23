import React from "react";

export default function GlossaryItem({ item, isMn }) {
  return (
    <div className="__list">
      <div className="__table_line"></div>
      <a
        className="__list_header"
        href={`/${isMn ? "mn" : "en"}/methodology/list/${item.id}`}
      >
        {isMn ? item.name : item.name_eng}
      </a>
      <div>
        <span className="__list_content">
          {isMn ? item.info : item.info_eng}
        </span>
      </div>
      <div className="__list_details">
        <span className="__list_date">
          <i className="pi pi-calendar-minus"></i>
          {item.last_modified_date &&
            new Date(item.last_modified_date).toISOString().split("T")[0]}
        </span>
      </div>
    </div>
  );
}
