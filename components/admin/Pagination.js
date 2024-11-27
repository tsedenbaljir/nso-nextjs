'use client'
import { useState, useEffect } from 'react'

export default function Pagination({ 
    currentPage, 
    totalItems, 
    rowsPerPage = 15,
    onPageChange,
    onRowsPerPageChange 
}) {
    const generatePageNumbers = () => {
        const pages = []
        const totalPages = Math.ceil(totalItems / rowsPerPage)
        
        // Always show first page
        pages.push(1)
        
        let startPage = Math.max(2, currentPage - 1)
        let endPage = Math.min(totalPages - 1, currentPage + 1)
        
        if (startPage > 2) pages.push('...')
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }
        
        if (endPage < totalPages - 1) pages.push('...')
        if (totalPages > 1) pages.push(totalPages)
        
        return pages
    }

    return (
        <div className="flex items-center justify-end gap-1 px-4 py-3 bg-white">
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
            >
                ⟨⟨
            </button>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
            >
                ⟨
            </button>

            {generatePageNumbers().map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...' || page === currentPage}
                    className={`px-2 py-1 text-sm border rounded min-w-[32px] ${
                        page === currentPage 
                            ? 'bg-gray-200 text-gray-700' 
                            : page === '...' 
                                ? 'border-none'
                                : 'hover:bg-gray-100'
                    }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage * rowsPerPage >= totalItems}
                className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
            >
                ⟩
            </button>
            <button
                onClick={() => onPageChange(Math.ceil(totalItems / rowsPerPage))}
                disabled={currentPage * rowsPerPage >= totalItems}
                className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50"
            >
                ⟩⟩
            </button>

            <span className="ml-4 text-sm">Нийт</span>
            <span className="px-2 py-1 text-sm bg-gray-200 rounded min-w-[48px] text-center">
                {totalItems}
            </span>
            <span className="text-sm">мэдээллээс</span>
            <select 
                className="px-2 py-1 text-sm border rounded"
                value={rowsPerPage}
                onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            >
                <option value="15">15</option>
            </select>
            <span className="text-sm">мөрөөр</span>
        </div>
    )
} 