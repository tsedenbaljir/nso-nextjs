import React from "react";
import { useRouter } from "next/navigation";

export default function GlossaryItem({ item, isMn, path }) {
  const router = useRouter();

  const handleClick = () => {
    const langPrefix = isMn ? "/mn" : "/en";
    router.push(`${langPrefix}/data-base/meta-data/${path || ""}/${item.id}`);
  };
  return (
    <div className="__list cursor-pointer" onClick={path ? handleClick : () => {}}>
      <div className="__table_line"></div>
      <a className="__list_header">{isMn ? item.name : item.name_eng}</a>
      {item.info && (
        <div className="description">
          <span className="__list_content">
            {isMn ? item.info : item.info_eng}
          </span>
        </div>
      )}
      <div className="__list_details">
        <span className="__list_date">
          <i className="pi pi-calendar-minus"></i>
          {item.last_modified_date &&
            new Date(item.last_modified_date).toISOString().split("T")[0]}
        </span>
        {item.views && (
          <span className="__list_view">
            <img src="/images/eye.png" />
            {item.views || 0}
          </span>
        )}
        {item.version && (
          <span className="__list_size">
            <i className="pi pi-tag"></i> {item.version || 0}
          </span>
        )}
      </div>
    </div>
  );
}
