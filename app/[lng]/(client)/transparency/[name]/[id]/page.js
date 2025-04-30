"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
      <div className="nso_statistic_category" style={{ background: 'white' }}>
        <div className="nso_container">
          <div className="w-full text-center h-56 items-center flex justify-center">
            <div className="loading">Уншиж байна...</div>
          </div>
        </div>
      </div>
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
          <div className="bg-gray-50 rounded-md shadow-inner p-4 border border-gray-200 overflow-x-auto">

            {/* PDF iframe */}
            <div className="w-full" style={{ minWidth: "300px" }}>
              <iframe
                src={data.file_path}
                className="w-full"
                style={{
                  minWidth: "300px",
                  height: "800px",
                  border: "1px solid #ccc",
                  borderRadius: "6px"
                }}
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
