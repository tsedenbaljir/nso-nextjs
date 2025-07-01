export default function ResultTable({ data, lng }) {
  if (!data || !data.id || !data.dimension || !data.value || !data.size) {
    return null;
  }

  // console.log('Data structure:', {
  //   id: data.id,
  //   dimension: data.dimension,
  //   size: data.size
  // });

  const yearKey = data.id.find((key) =>
    ['он', 'жил', 'улирал', 'хугацаа', 'сар'].some((kw) => key.toLowerCase() === kw)
  );

  if (!yearKey || !data.dimension[yearKey]) return null;

  const years = Object.entries(data.dimension[yearKey].category.index).map(
    ([code]) => ({
      code,
      label: data.dimension[yearKey].category.label[code] || code,
    })
  ).reverse();

  const rowKeys = data.id.filter((key) => key !== yearKey);

  const validRowKeys = rowKeys.filter((key) => data.dimension[key]).map(key => ({
    key,
    label: data.dimension[key].label || key
  }));

  console.log('Row keys:', {
    all: rowKeys,
    valid: validRowKeys
  });

  const rowDimensions = validRowKeys.map(({ key, label: dimensionLabel }) => {
    const index = data.dimension[key].category.index;
    const label = data.dimension[key].category.label;
    return Object.entries(index).map(([code, idx]) => ({
      code,
      label: label[code] || code,
      idx,
      key,
      dimensionLabel,
    })).sort((a, b) => a.idx - b.idx);
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

  // Group rows by the first dimension
  const groupedRows = rows.reduce((acc, row) => {
    const firstDimCode = row.rowCombo[0].code;
    if (!acc[firstDimCode]) {
      acc[firstDimCode] = [];
    }
    acc[firstDimCode].push(row);
    return acc;
  }, {});

  return (
    <div className='overflow-x-auto mt-3'>
      <table className='result-table min-w-full border border-gray-300'>
        <thead>
          <tr className='bg-gray-100'>
            {validRowKeys.map(({ key, label }, index) => (
              <th key={key} className='border p-2 min-w-60 font-medium text-sm'>
                {label}
              </th>
            ))}
            {years.map(({ code, label }) => (
              <th key={code} className='border p-2 font-medium text-sm'>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedRows).map(([groupCode, groupRows]) => (
            groupRows.map((row, rowIndex) => (
              <tr key={`${groupCode}-${rowIndex}`}>
                {row.rowCombo.map((combo, index) => (
                  index === 0 && rowIndex === 0 ? (
                    <td
                      key={`grouped-dim-${index}-${combo.code}`}
                      className='border p-2 min-w-60 font-normal text-sm align-top'
                      rowSpan={groupRows.length}
                    >
                      <span style={{ whiteSpace: 'pre' }}>{combo.label}</span>
                    </td>
                  ) : index > 0 ? (
                    <td
                      key={`dim-${index}-${combo.code}-${rowIndex}`}
                      className='border p-2 min-w-60 font-normal text-sm align-top'
                    >
                      <span style={{ whiteSpace: 'pre' }}>{combo.label}</span>
                    </td>
                  ) : null
                ))}

                {row.yearData.map((val, k) => (
                  <td key={k} className='border p-2 text-right min-w-[80px] font-normal text-sm align-top'>
                    {val != null ? val.toLocaleString('mn-MN') : '—'}
                  </td>
                ))}
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </div>
  );
}

