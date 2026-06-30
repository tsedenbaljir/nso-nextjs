"use client";
import { sanitizeHtml } from '@/utils/sanitizeHtml';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PdfViewer from '@/components/PdfViewer/index';
import TextLoading from '@/components/Loading/Text/Index';
import ContactSourceCard from '@/components/contact/ContactSourceCard';
import '@/components/styles/contact-us.scss';
import './detail.scss';

export default function TransparencyDetailPage() {
  const { id, lng } = useParams();
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
      <div className="nso_container py-10">
        <TextLoading />
      </div>
    );

  if (!data)
    return (
      <div className="no_data">
        Мэдээлэл олдсонгүй
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen pb-10 transparency_detail_page">
      <div className="nso_container max-w-5xl mx-auto py-10 px-4 flex flex-col gap-8">
        <div>
          <h2 className="text-3xl font-bold mb-4">{data.title}</h2>
          <div
            className="mt-1"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.description || "")}}
          />
        </div>

        {data.file_path && (
          <div className="pdf-container w-full h-[800px] overflow-hidden">
            <PdfViewer fileUrl={data.file_path} />
          </div>
        )}

        <div className="transparency_source_section">
          <ContactSourceCard lng={lng} sourceKey="transparencySource" />
        </div>
      </div>
    </div>
  );
}
