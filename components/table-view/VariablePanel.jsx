'use client';

import { useState } from 'react';
import VariableSelector from './VariableSelector';
import ResultTable from './ResultTable';

export default function VariablesPanel({ variables, url }) {
  const [selectedValues, setSelectedValues] = useState({});
  const [showOptions, setShowOptions] = useState(1);
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
      // console.loga('data', data);
      setResultData(data);
    } catch (err) {
      console.error('Алдаа:', err);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-row flex-wrap gap-2 mb-6'>
        {variables.map((variable) => (
          <VariableSelector
            key={variable.code}
            variable={variable}
            onChange={handleChange}
          />
        ))}
        <div className='flex flex-row flex-wrap gap-2 mb-6 col-span-4 min-w-[24%] max-w-[270px]'>
          <div className="border border-gray-400 rounded-md bg-white shadow flex flex-col w-full col-span-4">
            <h2 className="bg-[#005baa] text-white font-bold py-2 px-4 rounded-t flex items-center justify-between">
              <span>Харагдах төрөл</span>
            </h2>
            <div className='!min-h-60 min-w-[24%] max-w-[270px] overflow-y-auto h-full px-2 py-1 mb-2 bg-white'
              onClick={() => setShowOptions(1)}>
              <input
                type='radio'
                className='mr-2'
                value={1}
                checked={showOptions === 1}
                onChange={() => setShowOptions(1)}
              />
              <label className='cursor-pointer font-normal'>Хүснэгт</label>
            </div>
            <button
              onClick={handleResult}
              className='mt-3 bg-[#005baa] border rounded px-3 py-2 m-1 text-white font-normal'
            >
              Үр дүн харах
            </button>
          </div>
        </div>
      </div>
      {showOptions === 1 && resultData && (
        <ResultTable data={resultData} url={url} />
      )}
    </div>
  );
}
