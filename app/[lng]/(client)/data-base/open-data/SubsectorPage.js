"use client";
export default function SubsectorPage({ data }) {
  if (!data) return <div>Мэдээлэл олдсонгүй.</div>;

  return (
    <div className="__opendata_main_block">
      {/* Ерөнхий гарчиг */}
      <div className="__opendata_header">
        <h1>Статистикийн нээлттэй мэдээлэл</h1>
        <p>
          Статистикийн мэдээллийн нэгдсэн сангийн үзүүлэлтүүдийг онлайн сервисаар дамжуулан
          ашиглах боломжийг хэрэглэгчдэд хүргэж байна.
        </p>
      </div>

      <div className="__open_section">
        {/* Subsector Title */}
        <div className="__opendata_item">
          <h2># {data.title}</h2>
          {data.description && <p>{data.description}</p>}
        </div>

        {/* API Endpoint */}
        <div className="__opendata_item">
  <span className={`api_method_tag api_method_${(data.method || "GET").toLowerCase()}`}>
    {data.method || "GET"}
  </span>
  <pre className="code_block">{data.api}</pre>
</div>

{/* Оролтын утга */}
{data.input && (
  <div id="input" className="__opendata_item">
    <h2># Оролтын жишээ</h2>
    <table className="doc_table">
      <thead>
        <tr>
          <th>Нэр</th>
          <th>Утга</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(data.input).map(([key, value], i) => (
          <tr key={i}>
            <td>{key}</td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

    {/* Гаралтын утга */}
<div id="output" className="__opendata_item">
  <h2># Гаралтын утга</h2>
  <table className="doc_table">
    <thead>
      <tr>
        <th>Нэр</th>
        <th>Тайлбар</th>
        <th>Төрөл</th>
      </tr>
    </thead>
    <tbody>
      {data.output.map((r, i) => (
        <tr key={i}>
          <td>{r.Field}</td>
          <td>{r.Description}</td>
          <td>{r.Type}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* MIME type */}
<div id="outputExample" className="__opendata_item">
  <h2># Гаралтын жишээ</h2>
  <ul>
    <li><code>application/json, text/json</code></li>
    <li><code>application/xml, text/xml</code></li>
  </ul>
  <pre className="code_block">
    {JSON.stringify(data.outputExample, null, 2)}
  </pre>
</div>

      </div>
    </div>
  );
}
