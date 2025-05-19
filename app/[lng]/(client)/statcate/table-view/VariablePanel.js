'use client';

import { useState } from 'react';

const VariableSelector = ({ variable, onChange }) => {
  // console.log('variable', variable);
  const [isOpen, setIsOpen] = useState(true);
  const [selected, setSelected] = useState([]);
  const [childSelected, setChildSelected] = useState([]);
  const [grandChildSelected, setGrandChildSelected] = useState([]);
  const [greatGrandChildSelected, setGreatGrandChildSelected] = useState([]);

  const recomputeAndEmit = (base, child, grand, great) => {
    const filteredChild = variable.values.filter(
      (val) =>
        (val.length === 2 || val.length === 3) &&
        base.some((b) => val.startsWith(b) && b !== '0')
    );
    const newChild = child.filter((c) => filteredChild.includes(c));

    const filteredGrand = variable.values.filter(
      (val) => val.length === 5 && newChild.some((c) => val.startsWith(c))
    );
    const newGrand = grand.filter((g) => filteredGrand.includes(g));

    const filteredGreat = variable.values.filter(
      (val) => val.length === 7 && newGrand.some((g) => val.startsWith(g))
    );
    const newGreat = great.filter((gr) => filteredGreat.includes(gr));

    setSelected(base);
    setChildSelected(newChild);
    setGrandChildSelected(newGrand);
    setGreatGrandChildSelected(newGreat);
    onChange(variable.code, [...base, ...newChild, ...newGrand, ...newGreat]);
  };

  const toggleValue = (val) => {
    const updated = selected.includes(val)
      ? selected.filter((v) => v !== val)
      : [...selected, val];
    recomputeAndEmit(
      updated,
      childSelected,
      grandChildSelected,
      greatGrandChildSelected
    );
  };

  const toggleChild = (val) => {
    const updated = childSelected.includes(val)
      ? childSelected.filter((v) => v !== val)
      : [...childSelected, val];
    recomputeAndEmit(
      selected,
      updated,
      grandChildSelected,
      greatGrandChildSelected
    );
  };

  const toggleGrandChild = (val) => {
    const updated = grandChildSelected.includes(val)
      ? grandChildSelected.filter((v) => v !== val)
      : [...grandChildSelected, val];
    recomputeAndEmit(selected, childSelected, updated, greatGrandChildSelected);
  };

  const toggleGreatGrandChild = (val) => {
    const updated = greatGrandChildSelected.includes(val)
      ? greatGrandChildSelected.filter((v) => v !== val)
      : [...greatGrandChildSelected, val];
    recomputeAndEmit(selected, childSelected, grandChildSelected, updated);
  };

  const toggleAll = (level) => {
    let values = [];
    let current = [];
    switch (level) {
      case 'base':
        values = variable.values.filter((val) => val.length === 1);
        current = selected;
        recomputeAndEmit(
          current.length === values.length ? [] : values,
          childSelected,
          grandChildSelected,
          greatGrandChildSelected
        );
        break;
      case 'child':
        values = variable.values.filter(
          (val) =>
            (val.length === 2 || val.length === 3) &&
            selected.some((s) => val.startsWith(s))
        );
        current = childSelected;
        recomputeAndEmit(
          selected,
          current.length === values.length ? [] : values,
          grandChildSelected,
          greatGrandChildSelected
        );
        break;
      case 'grand':
        values = variable.values.filter(
          (val) =>
            val.length === 5 && childSelected.some((c) => val.startsWith(c))
        );
        current = grandChildSelected;
        recomputeAndEmit(
          selected,
          childSelected,
          current.length === values.length ? [] : values,
          greatGrandChildSelected
        );
        break;
      case 'great':
        values = variable.values.filter(
          (val) =>
            val.length === 7 &&
            grandChildSelected.some((g) => val.startsWith(g))
        );
        current = greatGrandChildSelected;
        recomputeAndEmit(
          selected,
          childSelected,
          grandChildSelected,
          current.length === values.length ? [] : values
        );
        break;
      default:
        break;
    }
  };

  return (
    <div className="border border-gray-400 rounded-md w-full max-w-80 min-w-80 bg-white shadow flex flex-col">
      <h2 className="bg-blue-700 text-white font-bold py-2 px-4 rounded-t flex items-center justify-between">
        <span>{variable.text}</span>
      </h2>

      {isOpen && (
        <div className="flex-1">
          {/* <p className="text-sm text-gray-600 mb-2">
            Сонгосон: {selected.length} | Нийт: {variable.values.length}
          </p> */}
          <div className="h-[250px] overflow-y-auto p-2">
            {variable.values
              .filter((val) => val.length === 1)
              .map((val) => (
                <div key={val} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    checked={selected.includes(val)}
                    onChange={() => toggleValue(val)}
                    className="mr-2"
                  />
                  <label>
                    {variable.valueTexts[variable.values.indexOf(val)] || val}
                  </label>
                </div>
              ))}
          </div>
          {/* <div className="pl-4 border-l-2 border-gray-200 mb-2 bg-gray-300"> */}
          {/* ...nested checkboxes... */}
          {/* </div> */}
          <div className="bg-gray-100 flex rounded-b-md flex-col gap-2 p-2 border-y border-gray-200">
            <button
              onClick={() => toggleAll('base')}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-normal rounded px-3 py-2 hover:bg-gray-50"
            >
              <input type="checkbox" checked={true} />
              Бүгдийг сонгох
            </button>
            <button
              onClick={() => toggleAll('base')}
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 rounded px-3 py-2 hover:bg-gray-100"
            >
              <input type="checkbox" checked={false} />
              Болих
            </button>
          </div>

          {(variable.code.includes('Баг') ||
            variable.code.includes('Аймг') ||
            variable.code.includes('Аймаг') ||
            variable.code.includes('Сум')) &&
            selected.includes('0') === false && (
              <>
                <h3 className='mt-4 font-semibold'>Дэд кодууд:</h3>
                <button
                  onClick={() => toggleAll('child')}
                  className='cursor-pointer text-sm mb-2 text-blue-600 underline'
                >
                  ✅ Бүгдийг{' '}
                  {childSelected.length ===
                    variable.values.filter(
                      (val) =>
                        (val.length === 2 || val.length === 3) &&
                        selected.some((s) => val.startsWith(s))
                    ).length
                    ? 'болих'
                    : 'сонгох'}
                </button>
                <button
                  onClick={() => toggleAll('child')}
                  className='cursor-pointer text-sm mb-2 text-blue-600 underline'
                >
                  ✅ Бүгдийг{' '}
                  {childSelected.length ===
                    variable.values.filter(
                      (val) =>
                        (val.length === 2 || val.length === 3) &&
                        selected.some((s) => val.startsWith(s))
                    ).length
                    ? 'болих'
                    : 'сонгох'}
                </button>
                <div className='max-h-48 overflow-y-auto border rounded px-2 py-1 mb-2'>
                  {variable.values
                    .filter(
                      (val) =>
                        (val.length === 2 || val.length === 3) &&
                        selected.some((s) => val.startsWith(s))
                    )
                    .map((val) => (
                      <div key={val} className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={childSelected.includes(val)}
                          onChange={() => toggleChild(val)}
                          className='mr-2'
                        />
                        <label>
                          {variable.valueTexts[variable.values.indexOf(val)] ||
                            val}
                        </label>
                      </div>
                    ))}
                </div>

                <h3 className='mt-4 font-semibold'>
                  Гуравдагч түвшний кодууд:
                </h3>
                <button
                  onClick={() => toggleAll('grand')}
                  className='cursor-pointer text-sm mb-2 text-blue-600 underline'
                >
                  ✅ Бүгдийг{' '}
                  {grandChildSelected.length ===
                    variable.values.filter(
                      (val) =>
                        val.length === 5 &&
                        childSelected.some((c) => val.startsWith(c))
                    ).length
                    ? 'болих'
                    : 'сонгох'}
                </button>
                <div className='max-h-48 overflow-y-auto border rounded px-2 py-1 mb-2'>
                  {variable.values
                    .filter(
                      (val) =>
                        val.length === 5 &&
                        childSelected.some((c) => val.startsWith(c))
                    )
                    .map((val) => (
                      <div key={val} className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={grandChildSelected.includes(val)}
                          onChange={() => toggleGrandChild(val)}
                          className='mr-2'
                        />
                        <label>
                          {variable.valueTexts[variable.values.indexOf(val)] ||
                            val}
                        </label>
                      </div>
                    ))}
                </div>

                <h3 className='mt-4 font-semibold'>
                  Дөрөвдөгч түвшний кодууд:
                </h3>
                <button
                  onClick={() => toggleAll('great')}
                  className='cursor-pointer text-sm mb-2 text-blue-600 underline'
                >
                  ✅ Бүгдийг{' '}
                  {greatGrandChildSelected.length ===
                    variable.values.filter(
                      (val) =>
                        val.length === 7 &&
                        grandChildSelected.some((g) => val.startsWith(g))
                    ).length
                    ? 'болих'
                    : 'сонгох'}
                </button>
                <div className='max-h-48 overflow-y-auto border rounded px-2 py-1 mb-2'>
                  {variable.values
                    .filter(
                      (val) =>
                        val.length === 7 &&
                        grandChildSelected.some((g) => val.startsWith(g))
                    )
                    .map((val) => (
                      <div key={val} className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={greatGrandChildSelected.includes(val)}
                          onChange={() => toggleGreatGrandChild(val)}
                          className='mr-2'
                        />
                        <label>
                          {variable.valueTexts[variable.values.indexOf(val)] ||
                            val}
                        </label>
                      </div>
                    ))}
                </div>
              </>
            )}
        </div>
      )}
    </div>
  );
};

const ResultTable = ({ data }) => {
  // console.log('data', data);
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
  // console.log('rowDimensions', validRowKeys);

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
  // console.log('rows', rows);
  return (
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
  );
};

export default function VariablesPanel({ variables, url }) {
  const [selectedValues, setSelectedValues] = useState({});
  const [resultData, setResultData] = useState(null);

  const handleChange = (code, values) => {
    setSelectedValues((prev) => ({ ...prev, [code]: values }));
  };

  const handleResult = async () => {
    const query = Object.entries(selectedValues)
      .filter(([_, values]) => values.length > 0) // зөвхөн утгатайг үлдээх
      .map(([code, values]) => ({
        code,
        selection: { filter: 'item', values },
      }));

    // console.log('query', query);

    if (query.length !== variables.length) {
      alert('Та дор хаяж нэг утга сонгоно уу!');
      return;
    }

    const postBody = {
      query,
      response: { format: 'json-stat2' },
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access-token': 'a79fb6ab-5953-4c46-a240-a20c2af9150a',
        },
        body: JSON.stringify(postBody),
      });

      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      // console.log('data', data);

      setResultData(data);
    } catch (err) {
      console.error('Алдаа:', err);
    }
  };

  return (
    <div className='flex gap-6'>
      <div className='flex flex-col flex-wrap gap-4 mb-6'>
        {variables.map((variable) => (
          <VariableSelector
            key={variable.code}
            variable={variable}
            onChange={handleChange}
          />
        ))}
        <button
          onClick={handleResult}
          className='cursor-pointer bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700'
        >
          Үр дүн харах
        </button>
      </div>
      {resultData && (
        <ResultTable
          data={resultData}
          regionOrder={
            variables.find((v) => v.code.includes('Баг') || v.code.includes('Аймг') || v.code.includes('Аймаг') || v.code.includes('Сум'))
              ?.values || []
          }
        />
      )}
    </div>
  );
}
