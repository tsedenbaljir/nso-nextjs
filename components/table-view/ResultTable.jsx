import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function exportPXWebToExcel(pxData, format = 'xlsx', filename = 'pxweb_data') {
  const dimensions = pxData.dimension;
  const dimensionIds = pxData.id;
  const labels = dimensionIds.map((id) => dimensions[id].label);
  const categoryLabels = dimensionIds.map((id) =>
    Object.values(dimensions[id].category.label)
  );

  const allCombinations = cartesian(...categoryLabels);
  const values = pxData.value;

  const table = allCombinations.map((row, idx) => {
    const record = {};
    labels.forEach((label, i) => {
      record[label] = row[i];
    });
    record['Утга'] = values[idx] ?? '';
    return record;
  });

  const ws = XLSX.utils.json_to_sheet(table);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, filename);

  const now = new Date();
  const timestamp = now
    .toISOString()
    .slice(0, 16)
    .replace('T', '_')
    .replace(':', '');

  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}_${timestamp}.csv`);
  } else {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `${filename}_${timestamp}.xlsx`);
  }
}

function cartesian(...arrays) {
  return arrays.reduce((a, b) =>
    a.flatMap((d) => b.map((e) => [...(Array.isArray(d) ? d : [d]), e]))
  );
}

function getTableId(url) {
  return url.split('/').pop()?.replace('.px', '') || '';
}

export default function ResultTable({ data, url }) {
  if (!data || !data.id || !data.dimension || !data.value || !data.size)
    return null;

  const yearKey = data.id.find((key) =>
    ['он', 'жил', 'улирал'].some((kw) => key.toLowerCase().includes(kw))
  );

  if (!yearKey || !data.dimension[yearKey]) return null;

  const years = Object.entries(data.dimension[yearKey].category.index).map(
    ([code]) => ({
      code,
      label: data.dimension[yearKey].category.label[code] || code,
    })
  );

  const rowKeys = data.id.filter((key) => key !== yearKey);
  const validRowKeys = rowKeys.filter((key) => data.dimension[key]);

  const rowDimensions = validRowKeys.map((key) => {
    const index = data.dimension[key].category.index;
    const label = data.dimension[key].category.label;
    return Object.entries(index).map(([code, idx]) => ({
      code,
      label: label[code] || code,
      idx,
      key,
    }));
  });

  const combinations = [];
  const generateCombinations = (dims, prefix = []) => {
    if (dims.length === 0) {
      combinations.push(prefix);
      return;
    }
    for (const val of dims[0]) {
      generateCombinations(dims.slice(1), [...prefix, val]);
    }
  };
  generateCombinations(rowDimensions);

  const rows = combinations.map((combo) => {
    const indices = combo.map((c) => c.idx);
    const yearData = years.map(({ code }) => {
      const yearIdx = data.dimension[yearKey].category.index[code];
      const dimSizes = [...indices, yearIdx];
      const idx = dimSizes.reduce(
        (acc, currIdx, i) =>
          acc + currIdx * data.size.slice(i + 1).reduce((a, b) => a * b, 1),
        0
      );
      return data.value[idx] ?? null;
    });

    return {
      rowCombo: combo,
      yearData,
    };
  });

  return (
    <>
      <div className='flex gap-2 my-4'>
        <button
          onClick={() => exportPXWebToExcel(data, 'xlsx', getTableId(url))}
          className='bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700'
        >
          Excel (.xlsx)
        </button>
        <button
          onClick={() => exportPXWebToExcel(data, 'csv', getTableId(url))}
          className='bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700'
        >
          CSV (.csv)
        </button>
      </div>
      <div className='overflow-x-auto'>
        <table className='min-w-full border border-gray-300'>
          <thead>
            <tr className='bg-gray-100'>
              {validRowKeys.map((key) => (
                <th key={key} className='border p-2 min-w-60'>
                  {key}
                </th>
              ))}
              {years.map(({ code, label }) => (
                <th key={code} className='border p-2'>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.rowCombo.map((dim, j) => (
                  <td key={j} className='border p-2 min-w-60'>
                    {dim.label}
                  </td>
                ))}
                {row.yearData.map((val, k) => (
                  <td key={k} className='border p-2 text-right min-w-[80px]'>
                    {val != null ? val.toLocaleString('mn-MN') : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
