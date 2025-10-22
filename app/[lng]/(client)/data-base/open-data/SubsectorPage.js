"use client";
export default function SubsectorPage({ data, lng }) {
  if (!data) return <div>{lng === 'mn' ? 'Мэдээлэл олдсонгүй.' : 'Data not found.'}</div>;

  return (
    <div className="__opendata_main_block">
      {/* Ерөнхий гарчиг */}
      <div className="__opendata_header">
        <h1>{lng === 'mn' ? 'Статистикийн нээлттэй мэдээлэл' : 'Open Data'}</h1>
        <p>
          {lng === 'mn' ? 'Статистикийн мэдээллийн нэгдсэн сангийн үзүүлэлтүүдийг онлайн сервисаар дамжуулан ашиглах боломжийг хэрэглэгчдэд хүргэж байна.' : 'The common statistical data of the integrated statistical system is disseminated through an online service to allow users to access and use the data.'}
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
            <h2># {lng === 'mn' ? 'Оролтын жишээ' : 'Input Example'}</h2>
            <table className="doc_table">
              <thead>
                <tr>
                  <th>{lng === 'mn' ? 'Нэр' : 'Name'}</th>
                  <th>{lng === 'mn' ? 'Утга' : 'Value'}</th>
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
          <h2># {lng === 'mn' ? 'Гаралтын утга' : 'Output'}</h2>
          <table className="doc_table">
            <thead>
              <tr>
                <th>{lng === 'mn' ? 'Нэр' : 'Name'}</th>
                <th>{lng === 'mn' ? 'Тайлбар' : 'Description'}</th>
                <th>{lng === 'mn' ? 'Төрөл' : 'Type'}</th>
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
          <h2># {lng === 'mn' ? 'Гаралтын жишээ' : 'Output Example'}</h2>
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
