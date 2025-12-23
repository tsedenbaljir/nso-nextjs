import React, { useState } from 'react';
import { handlePrint } from './print';
import { exportPXWebToExcel } from './download';

export default function ExportButton({ data, title, lng, metadataUrl }) {
    const [showOptions, setShowOptions] = useState(false);  

    return (
        <div className='w-full'>
            <div className='float-right mr-5 mb-1'>
                <div className='flex'>
                    <div
                        onClick={() => setShowOptions(!showOptions)}
                        className='text-blue-600 hover:text-gray-600 px-2 py-1 rounded flex items-center gap-2 text-sm cursor-pointer'
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {lng === 'mn' ? 'Татах' : 'Download'}
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
                        {lng === 'mn' ? 'Хэвлэх' : 'Print'}
                    </div>
                </div>
                <div className={'absolute ' + (showOptions ? 'block' : 'hidden') + ' w-60 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10'}>
                    <button
                        onClick={() => exportPXWebToExcel(data, 'xlsx', title, metadataUrl)}
                        className='w-full text-right px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2'
                    >
                        <svg className="w-2 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Excel (.xlsx)
                    </button>
                    <button
                        onClick={() => exportPXWebToExcel(data, 'csv', title, metadataUrl)}
                        className='w-full text-right px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2'
                    >
                        <svg className="w-2 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        CSV (.csv)
                    </button>
                </div>
            </div>
        </div>
    );
} 