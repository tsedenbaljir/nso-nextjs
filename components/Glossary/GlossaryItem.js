import React from "react";
import { useRouter } from "next/navigation";

export default function GlossaryItem({ item, isMn, path }) {
  const router = useRouter();

  const handleClick = () => {
    const langPrefix = isMn ? "/mn" : "/en";
    router.push(`${langPrefix}/data-base/meta-data/${path || ""}/${item.id}`);
  };

  return (
    <div
      className="border-b pb-4 pt-4 cursor-pointer hover:bg-gray-50 transition w-[100%]"
      onClick={path ? handleClick : () => {}}
    >
      {/* Гарчиг */}
      <div className="text-[16px] font-bold uppercase text-gray-900 leading-snug">
        {isMn ? item.name : item.name_eng}
      </div>

      {/* Тайлбар */}
      {item.info && (
        <p className="text-sm text-gray-600 mt-1">
          {isMn ? item.info : item.info_eng}
        </p>
      )}

      {/* Доод metadata */}
      <div className="flex items-center gap-6 mt-3 text-xs text-gray-500 flex-wrap">
        {/* Огноо */}
        {item.last_modified_date && (
          <span className="flex items-center gap-1">
            <i className="pi pi-calendar-minus"></i>
            {new Date(item.last_modified_date).toISOString().split("T")[0]}
          </span>
        )}

        {/* Хандалт */}
        {item.views != null && (
          <span className="flex items-center gap-1">
            <img src="/images/eye.png" className="w-4 h-4" />
            {item.views}
          </span>
        )}

        {/* Хувилбар */}
        {item.version && (
          <span className="flex items-center gap-1">
            <i className="pi pi-tag"></i>
            {item.version}
          </span>
        )}
      </div>
    </div>
  );
}
