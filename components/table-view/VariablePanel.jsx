'use client';

import { useState, useEffect } from 'react';
import ResultTable from './ResultTable';
import ExportButton from './ExportButton';
import VariableSelector from './VariableSelector';

export default function VariablesPanel({ variables, title, url, lng }) {
  const [selectedValues, setSelectedValues] = useState({});
  const [selectedValuesCount, setSelectedValuesCount] = useState(0);
  const [showOptions, setShowOptions] = useState(1);
  const [resultData, setResultData] = useState(null);

  const handleChange = (code, values) => {
    setSelectedValues((prev) => ({ ...prev, [code]: values }));
  };

  const handleResult = async () => {
    if (selectedValuesCount > 100000) {
      alert('Сонгох боломжтой хамгийн их тоо 100 000 байна.');
      return;
    }
    const query = Object.entries(selectedValues)
      .filter(([_, values]) => values.length > 0) // зөвхөн утгатайг үлдээх
      .map(([code, values]) => ({
        code,
        selection: { filter: 'item', values },
      }));

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

      if (!res.ok) {
        alert('Хүснэгтийг буруу оруулсан байна.');
        return;
      };
      const data = await res.json();
      setResultData(data);
    } catch (err) {
      console.error('Алдаа:', err);
    }
  };

  useEffect(() => {
    var count = 1;
    if (Object.keys(selectedValues).length > 0)
      for (const value of Object.values(selectedValues)) {
        count *= value.length;
      }
    setSelectedValuesCount(count);
  }, [selectedValues]);

  return (
    <div className='flex flex-col'>
      <ExportButton data={resultData} title={title} lng={lng} />
      <div className='flex flex-row flex-wrap gap-2'>
        {variables.map((variable) => (
          <VariableSelector
            key={variable.code}
            variable={variable}
            onChange={handleChange}
            lng={lng}
          />
        ))}
        <div className='flex flex-row flex-wrap gap-2 col-span-4 min-w-[24%] max-w-[270px]'>
          <div className="border border-gray-400 rounded-md bg-white shadow flex flex-col w-full col-span-4">
            <h2 className="bg-[#005baa] text-white font-bold py-2 px-4 rounded-t flex items-center justify-between">
              <span>{lng === 'mn' ? 'Харагдах төрөл' : 'View type'}</span>
            </h2>
            <div className='!min-h-64 min-w-[24%] max-w-[270px] overflow-y-auto h-full px-2 py-1 mb-2 bg-white'
              onClick={() => setShowOptions(1)}>
              <input
                type='radio'
                className='mr-2'
                value={1}
                checked={showOptions === 1}
                onChange={() => setShowOptions(1)}
              />
              <label className='cursor-pointer font-normal'>{lng === 'mn' ? 'Хүснэгт' : 'Table'}</label>
            </div>
            <button
              onClick={handleResult}
              className='mt-3 bg-[#005baa] border rounded px-3 py-2 m-1 text-white font-normal'
            >
              {lng === 'mn' ? 'Үр дүн харах' : 'View result'}
            </button>
          </div>
        </div>
      </div>
      <div className='text-base text-gray-500 mt-4 w-full text-center'>
        Сонгогдсон утгын тоо: {selectedValuesCount > 1 ? selectedValuesCount : ''}
        <br />
        (Сонгох боломжтой хамгийн их тоо 100 000)
      </div>
      {showOptions === 1 && resultData && (
        <ResultTable data={resultData} url={url} lng={lng} />
      )}
    </div>
  );
}
