"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PdfViewer from '@/components/PdfViewer/index';
export default function TransparencyDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/transparency/${id}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.status) setData(res.data);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading)
    return (
      <div className="loading">Уншиж байна...</div>
    );

  if (!data)
    return (
      <div className="no_data">
        Мэдээлэл олдсонгүй
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* Үндсэн контент хэсэг */}
      <div className="nso_container max-w-5xl mx-auto py-10 px-4 flex flex-col gap-8">
        {/* === Гарчиг + Description багц === */}
        <div>
          {/* Title */}
          <h2 className="text-3xl font-bold mb-4">{data.title}</h2>

          {/* Description */}
          <div
            className="mt-1"
            dangerouslySetInnerHTML={{ __html: data.description || "" }}
          />
        </div>

        {/* === PDF файл байвал харах === */}
        {data.file_path && (
          <div className="pdf-container w-full h-[800px] overflow-hidden">
            <PdfViewer fileUrl={data.file_path} />
          </div>
        )}
      </div>
    </div>
  );
}
