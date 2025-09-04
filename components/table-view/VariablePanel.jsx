'use client';

import { useState, useEffect } from 'react';
import { notification } from 'antd';
import ResultTable from './charts/Table';
import ExportButton from './ExportButton';
import VariableSelector from './VariableSelector';
import { LoadingOutlined } from '@ant-design/icons';
import LineChart from './charts/LineChart';
import ColumnChart from './charts/ColumnChart';
import BarChart from './charts/BarChart';
import AreaChart from './charts/AreaChart';
import PieChart from './charts/PieChart';

export default function VariablesPanel({ variables, title, url, lng, setSelectedValues, selectedValues }) {
  const [selectedValuesCount, setSelectedValuesCount] = useState(0);
  const [showOptions, setShowOptions] = useState(1);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Configure notification to show in center
  notification.config({
    placement: 'top',
    top: '50%',
    transform: 'translateY(-50%)',
  });

  const handleChange = (code, values) => {
    setSelectedValues((prev) => ({ ...prev, [code]: values }));
  };

  const handleResult = async () => {
    if (selectedValuesCount > 1000000) {
      notification.warning({
        message: lng === 'mn' ? 'Анхааруулга' : 'Warning',
        description: lng === 'mn' ? 'Сонгох боломжтой хамгийн их тоо 1 000 000 байна.' : 'The maximum number of selectable values is 1 000 000.',
        duration: 3,
        placement: 'top',
      });
      return;
    }
    const query = Object.entries(selectedValues)
      .filter(([_, values]) => values.length > 0) // зөвхөн утгатайг үлдээх
      .map(([code, values]) => ({
        code,
        selection: { filter: 'item', values },
      }));

    if (query.length !== variables.length) {
      notification.warning({
        message: lng === 'mn' ? 'Анхааруулга' : 'Warning',
        description: lng === 'mn' ? 'Та дор хаяж нэг утга сонгоно уу!' : 'You must select at least one value!',
        duration: 3,
        placement: 'top',
      });
      return;
    } else {
      setLoading(true);
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
          notification.error({
            message: lng === 'mn' ? 'Алдаа' : 'Error',
            description: lng === 'mn' ? 'Хүснэгтийг буруу оруулсан байна.' : 'The table is incorrect.',
            duration: 3,
            placement: 'top',
          });
          return;
        };
        const data = await res.json();
        setResultData(data);
      } catch (err) {
        console.error(lng === 'mn' ? 'Алдаа:' : 'Error :', err);
        notification.error({
          message: lng === 'mn' ? 'Алдаа' : 'Error',
          description: lng === 'mn' ? 'Алдаа гарлаа. Дахин оролдоно уу.' : 'An error occurred. Please try again.',
          duration: 3,
          placement: 'top',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    var count = 1;
    if (Object.keys(selectedValues).length > 0) {
      for (const value of Object.values(selectedValues)) {
        count *= value.length;
      }
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
        <div className='flex flex-row flex-wrap gap-2 col-span-4 w-full md:min-w-[24%] md:max-w-[270px]'>
          <div className="border border-gray-400 rounded-md bg-white shadow flex flex-col w-full col-span-4">
            <h2 className="bg-[#005baa] text-white font-medium py-2 px-4 rounded-t flex items-center justify-between">
              <span>{lng === 'mn' ? 'Харагдах төрөл' : 'View type'}</span>
            </h2>
            <div className='!min-h-64 min-w-[24%] max-w-[270px] overflow-y-auto h-full px-2 py-1 mb-2 bg-white'>
              <div className='flex flex-row flex-wrap gap-2 mt-1'
                onClick={() => setShowOptions(1)}>
                <input
                  type='radio'
                  className='mr-2'
                  value={1}
                  checked={showOptions === 1}
                  onClick={() => setShowOptions(1)}
                />
                <label className='cursor-pointer font-normal text-sm'>{lng === 'mn' ? 'Хүснэгт' : 'Table'}</label>
              </div>
              <div className='flex flex-row flex-wrap gap-2 mt-1'
                onClick={() => setShowOptions(2)}>
                <input
                  type='radio'
                  className='mr-2'
                  value={2}
                  checked={showOptions === 2}
                  onClick={() => setShowOptions(2)}
                />
                <label className='cursor-pointer font-normal text-sm'>{lng === 'mn' ? 'Шугаман график' : 'Line charts'}</label>
              </div>
              <div className='flex flex-row flex-wrap gap-2 mt-1'
                onClick={() => setShowOptions(3)}>
                <input
                  type='radio'
                  className='mr-2'
                  value={3}
                  checked={showOptions === 3}
                  onClick={() => setShowOptions(3)}
                />
                <label className='cursor-pointer font-normal text-sm'>{lng === 'mn' ? 'Баганан график' : 'Column charts'}</label>
              </div>
              <div className='flex flex-row flex-wrap gap-2 mt-1'
                onClick={() => setShowOptions(4)}>
                <input
                  type='radio'
                  className='mr-2'
                  value={4}
                  checked={showOptions === 4}
                  onClick={() => setShowOptions(4)}
                />
                <label className='cursor-pointer font-normal text-sm'>{lng === 'mn' ? 'Туузан график' : 'Bar charts'}</label>
              </div>
              <div className='flex flex-row flex-wrap gap-2 mt-1'
                onClick={() => setShowOptions(5)}>
                <input
                  type='radio'
                  className='mr-2'
                  value={5}
                  checked={showOptions === 5}
                  onClick={() => setShowOptions(5)}
                />
                <label className='cursor-pointer font-normal text-sm'>{lng === 'mn' ? 'Талбайн график' : 'Area charts'}</label>
              </div>
              <div className='flex flex-row flex-wrap gap-2 mt-1'
                onClick={() => setShowOptions(6)}>
                <input
                  type='radio'
                  className='mr-2'
                  value={6}
                  checked={showOptions === 6}
                  onClick={() => setShowOptions(6)}
                />
                <label className='cursor-pointer font-normal text-sm'>{lng === 'mn' ? 'Дугуй график' : 'Pie charts'}</label>
              </div>
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
        {lng === 'mn' ? 'Сонгогдсон утгын тоо:' : 'Selected values:'} {selectedValuesCount > 1 ? selectedValuesCount : ''}
        <br />
        {lng === 'mn' ? '(Сонгох боломжтой хамгийн их тоо 1 000 000)' : '(Maximum number of selectable values: 1 000 000)'}
      </div>
      {loading ? (
        <div className='flex items-center justify-center h-44'>
          <div className='text-center'>
            <LoadingOutlined spin style={{ fontSize: '24px', color: '#005baa' }} />
            <br />
            <p className='text-gray-500 text-lg'>Уншиж байна...</p>
          </div>
        </div>
      ) : resultData && (
        <>
          {showOptions === 1 && <ResultTable data={resultData} url={url} lng={lng} />}
          {showOptions === 2 && <LineChart data={resultData} lng={lng} title={title} />}
          {showOptions === 3 && <ColumnChart data={resultData} lng={lng} title={title} />}
          {showOptions === 4 && <BarChart data={resultData} lng={lng} title={title} />}
          {showOptions === 5 && <AreaChart data={resultData} lng={lng} title={title} />}
          {showOptions === 6 && <PieChart data={resultData} lng={lng} title={title} />}
        </>
      )}
    </div>
  );
}
