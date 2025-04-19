"use client";
import OpendataTable from "@/components/opendata/OpendataTable";

export default function SubsectorContent({ sectorData }) {
  if (!sectorData) return null;

  return (
    <div className="__subsector_content">
      <h1>{sectorData.title}</h1>
      <p>{sectorData.description}</p>

      <h2>📌 API Endpoint</h2>
      <pre className="bg-black text-white p-2 rounded">{sectorData.api}</pre>

      {sectorData.urlInput && (
        <>
          <h3>Оролтын утга</h3>
          <OpendataTable data={sectorData.urlInput} />
        </>
      )}

      {sectorData.inputExample && (
        <>
          <h3>Оролтын жишээ</h3>
          <pre className="bg-gray-100 p-2">{sectorData.inputExample}</pre>
        </>
      )}

      {sectorData.output && (
        <>
          <h3>Гаралтын утга</h3>
          <OpendataTable data={sectorData.output} />
        </>
      )}

      {sectorData.outputExample && (
        <>
          <h3>Гаралтын жишээ</h3>
          <pre className="bg-gray-100 p-2">{sectorData.outputExample}</pre>
        </>
      )}
    </div>
  );
}
