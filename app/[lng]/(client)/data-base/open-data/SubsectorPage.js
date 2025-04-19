"use client";
export default function SubsectorPage({ data }) {
  if (!data) return <div>Мэдээлэл олдсонгүй.</div>;

  return (
    <div className="__opendata_header">
      <h1>{data.title}</h1>
      <p>{data.description}</p>

      <h2># API линк</h2>
      <pre>{data.api}</pre>

      <h2># Оролтын утга</h2>
      <table>
        <thead>
          <tr><th>Parameter</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          {data.urlInput.map((r, i) => (
            <tr key={i}><td>{r.Parameter}</td><td>{r.Type}</td><td>{r.Description}</td></tr>
          ))}
        </tbody>
      </table>

      <h2># Оролтын жишээ</h2>
      <pre>{data.inputExample}</pre>

      <h2># Гаралтын утга</h2>
      <table>
        <thead>
          <tr><th>Field</th><th>Type</th><th>Description</th></tr>
        </thead>
        <tbody>
          {data.output.map((r, i) => (
            <tr key={i}><td>{r.Field}</td><td>{r.Type}</td><td>{r.Description}</td></tr>
          ))}
        </tbody>
      </table>

      <h2># Гаралтын жишээ</h2>
      <pre>{data.outputExample}</pre>
    </div>
  );
}
