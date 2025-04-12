import React from 'react';

export default function InputItems({ name, data, setData }) {
    return (
        <div className="flex-auto">
            <div className="relative">
                <input
                    type="text"
                    id="nameInput"
                    placeholder=""
                    className="block px-2.5 pb-2.5 pt-2 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-3 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                />
                <label for="nameInput" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1">{name}*</label>
            </div>
        </div>
    );
}
