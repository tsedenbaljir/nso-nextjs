"use client"
import React from 'react';
import Link from 'next/link';
import { Path } from '@/utils/path';

export default function componentName(props) {
    var pth = Path().split("/")[3];
    return (
        <>
            <header className="sticky top-0 z-999 flex w-full border-b border-stroke dark:border-stroke-dark dark:bg-gray-dark bg-gray-1">
                <div className="flex flex-grow items-center justify-between px-4 py-5 shadow-2 md:px-5 2xl:px-10">
                    <div className="hidden xl:block">
                        <div>
                            <h1 className="mb-0.5 text-heading-5 font-bold text-dark-5 dark:text-white">
                                Удирдах самбар
                            </h1>
                            <p className="font-medium text-dark-4">Үндэсний Статистикийн Хорооны сайтын удирдлага</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-normal gap-2 2xsm:gap-4 lg:w-full lg:justify-between xl:w-auto xl:justify-normal">
                        <ul className="flex items-center gap-2 2xsm:gap-4">
                            {pth !== "dashboard" && <Link href={
                                pth === "news" ? "/admin/news/new" :
                                    pth === "dissemination" ? "/admin/dissemination/new" :
                                        pth === "workspace" ? "/admin/workspace/new" :
                                            pth === "menus" ? "/admin/menus/new" :
                                                ""
                            }>
                                <div
                                    className={`relative flex rounded-[7px] px-3.5 py-2 font-medium duration-300 ease-in-out dark:bg-white/10 text-white bg-blue-600`}
                                >
                                    Шинээр үүсгэх
                                </div>
                            </Link>}
                        </ul>
                    </div>
                </div>
            </header>
        </>
    );
}
