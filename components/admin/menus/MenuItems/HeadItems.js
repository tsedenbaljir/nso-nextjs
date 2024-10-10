"use client"
import React from 'react';
import { useRouter } from "next/navigation";

export default function HeadItems() {
    const router = useRouter();
    return (
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <main className='dark:bg-black h-full'>
                <div className="flex flex-grow items-center justify-between px-4 py-5 shadow-2 md:px-5 2xl:px-10">
                    <div className="flex items-center justify-normal gap-2 2xsm:gap-4 lg:w-full lg:justify-between xl:w-auto xl:justify-normal">
                        <div className="nso_btn nso_btn_default margin_left_10 bg-blue-100 text-blue-600 font-extrabold text-xl">
                            45
                        </div>
                        <div className="nso_btn nso_btn_default margin_left_10 bg-red-light-5 text-red-light-2 font-extrabold text-xl">
                            12
                        </div>
                        <button className="nso_btn nso_btn_default margin_left_10 bg-blue-600 text-white"
                            onClick={() => {
                                router.push("/admin/menus/new")
                            }}
                        >
                            Шинээр нэмэх
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
