import React from 'react';

export default function SelectInput({ data, setFields }) {
    return (
        <div className="flex items-center">
            <select
                id="selectInput"
                onChange={(e) => setFields(parseInt(e.target.value))}
                className="bg-gray-50 border border-gray-3 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
                {data.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                    </option>
                ))}
            </select>
            <label htmlFor="selectInput" className="sr-only">
                Select option
            </label>
        </div>
    );
}
