import React from 'react';

export default function Upload({ setHeaderImageFile }) {
    return (
        <div className="w-full">
            <div className="relative">
                <label
                    className="block mb-2 text-sm font-medium text-gray-7 dark:text-white"
                    htmlFor="file_input"
                >
                    Нүүр зураг
                </label>
                <div className="flex items-center space-x-2">
                    <div className="flex-1">
                        <input
                            className="block w-full text-sm text-gray-7 border border-gray-3 rounded-lg cursor-pointer bg-gray-1 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-gray-2 file:text-gray-7 hover:file:bg-gray-3 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            id="file_input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file && file.size <= 3145728) {
                                    setHeaderImageFile(file);
                                } else {
                                    alert(`Зөвшөөрөх файлын төрөл: PNG, JPG, JPEG (Хамгийн их хэмжээ: 3MB). Таны оруулсан файлын хэмжээ: ${(file.size / 1024 / 1024).toFixed(2)} MB байна.`);
                                    setHeaderImageFile(null);
                                }
                            }}
                        />
                    </div>
                </div>
                <p className="mt-1 text-sm text-gray-6 dark:text-gray-4">
                    Зөвшөөрөх файлын төрөл: PNG, JPG, JPEG (Хамгийн их хэмжээ: 3MB)
                </p>
            </div>
        </div>
    );
}
