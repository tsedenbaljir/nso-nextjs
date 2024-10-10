"use client"
import React from 'react';
import { useRouter } from "next/navigation";

export default function Items({ menus }) {
    const router = useRouter();
    return (
        <>
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 bg-gray-3">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            #
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Нэр
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Цэсний төрөл
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Эрэмбэлэлт
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Төлөв
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Үйлдэл
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {menus.map((dt, i) => {
                        if (i % 2 === 0) {
                            return <tr key={i} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {i + 1}
                                </th>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {dt.name}
                                </th>
                                <td className="px-6 py-4">
                                    {dt.typeMenu}
                                </td>
                                <td className="px-6 py-4">
                                    {dt.order}
                                </td>
                                <td className="px-6 py-4">
                                    {dt.active}
                                </td>
                                <td className="px-6 py-4">
                                    <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                    onClick={()=>{
                                        router.push("/admin/menus/"+ dt.id)
                                    }}
                                    >Засварлах</a>
                                </td>
                            </tr>
                        } else {
                            return <tr key={i} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {i + 1}
                                </th>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {dt.name}
                                </th>
                                <td className="px-6 py-4">
                                    {dt.typeMenu}
                                </td>
                                <td className="px-6 py-4">
                                    {dt.order}
                                </td>
                                <td className="px-6 py-4">
                                    {dt.active}
                                </td>
                                <td className="px-6 py-4">
                                    <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                    onClick={()=>{
                                        router.push("/admin/menus/"+ dt.id)
                                    }}
                                    >Засварлах</a>
                                </td>
                            </tr>
                        }
                    })}
                </tbody>
            </table>
        </>
    );
}
