'use client';

import { useState } from 'react';
import ResultTable from './ResultTable';
import { handlePrint } from './print';
import { exportPXWebToExcel } from './download';
import VariableSelector from './VariableSelector';

export default function VariablesPanel({ variables, title, url }) {
  const [selectedValues, setSelectedValues] = useState({});
  const [showOptions, setShowOptions] = useState(1);
  const [resultData, setResultData] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);


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
    <div className='flex flex-col'>
      <div className='w-full'>
        <div className='float-right mr-5 mb-1'>
          <div className='flex'>
            <div
              onClick={() => setShowExportOptions(!showExportOptions)}
              className='text-blue-600 hover:text-gray-600 px-2 py-1 rounded flex items-center gap-2 text-sm cursor-pointer'
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Татах
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>|
            <div
              onClick={() => { handlePrint(title) }}
              className='text-blue-600 hover:text-gray-600 px-2 py-1 rounded flex items-center gap-2 text-sm cursor-pointer'
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Хэвлэх
            </div>
          </div>
          <div className={'absolute ' + (showExportOptions ? 'block' : 'hidden') + ' w-60 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10'}>
            <button
              onClick={() => exportPXWebToExcel(resultData, 'xlsx', title)}
              className='w-full text-right px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2'
            >
              <svg className="w-2 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel (.xlsx)
            </button>
            <button
              onClick={() => exportPXWebToExcel(resultData, 'csv', title)}
              className='w-full text-right px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2'
            >
              <svg className="w-2 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV (.csv)
            </button>
            {/* <button
            onClick={() => exportPXWebToText(resultData, title)}
            className='w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2'
          >
            <svg className="w-2 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Text (.txt)
          </button> */}
          </div>
        </div>
      </div>
      <div className='flex flex-row flex-wrap gap-2'>
        {variables.map((variable) => (
          <VariableSelector
            key={variable.code}
            variable={variable}
            onChange={handleChange}
          />
        ))}
        <div className='flex flex-row flex-wrap gap-2 col-span-4 min-w-[24%] max-w-[270px]'>
          <div className="border border-gray-400 rounded-md bg-white shadow flex flex-col w-full col-span-4">
            <h2 className="bg-[#005baa] text-white font-bold py-2 px-4 rounded-t flex items-center justify-between">
              <span>Харагдах төрөл</span>
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
