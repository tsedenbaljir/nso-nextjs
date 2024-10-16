"use client"

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DarkModeSwitcher from './darkMode';
import { Path } from '@/utils/path';
import { signOut } from "next-auth/react";
import MenuItems from './MenuItems';
import { LogoutOutlined } from '@ant-design/icons';

export default function Sidebar() {
  var pth = Path().split("/")[3];
  return (
    <>
      <aside className="absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden border-r border-stroke  dark:border-stroke-dark dark:bg-gray-dark lg:static lg:translate-x-0">
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 xl:py-10">
          <Link className="" href="/admin/dashboard">
            <Image
              width={200}
              height={32}
              src={"/images/logo.png"}
              alt="Logo"
            />
          </Link>
        </div>
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-1 px-4 lg:px-6">
            <div >
              <h3 className="mb-3 text-sm font-medium text-dark-4 dark:text-dark-6 border-b">
                ҮНДСЭН ЦЭС
              </h3>
              <ul className="mb-6 flex flex-col gap-2">
                <MenuItems name={"Үйл явдал"} isActive={pth === "news"} link={"/news"} />
                <MenuItems name={"Бидний тухай"} isActive={pth === "about"} link={"/about"} />
                <MenuItems name={"Цэсний тохиргоо"} isActive={pth === "menus"} link={"/menus"} />
                <MenuItems name={"Ажлын байр"} isActive={pth === "workspace"} link={"/workspace"} />
                <MenuItems name={"Хамтын ажиллагаа"} isActive={pth === "cooperation"} link={"/cooperation"} />
              </ul>
            </div>
            <div >
              <h3 className="mb-3 text-sm font-medium text-dark-4 dark:text-dark-6 border-b">
                ТУСЛАХ ХЭСЭГ
              </h3>
              <Link href="/submenus">
                <div
                  className={`relative flex rounded-[7px] px-3.5 py-2 font-medium duration-300 ease-in-out ${pth === ""
                    ? "bg-primary/[.07] text-primary dark:bg-white/10 dark:text-white"
                    : "text-dark-4 hover:bg-gray-2 hover:text-dark dark:text-gray-5 dark:hover:bg-white/10 dark:hover:text-white"
                    }`}
                >Жижиг цэс</div>
              </Link>
              <Link href="/settings">
                <div
                  className={`relative flex rounded-[7px] px-3.5 py-2 font-medium duration-300 ease-in-out ${pth === ""
                    ? "bg-primary/[.07] text-primary dark:bg-white/10 dark:text-white"
                    : "text-dark-4 hover:bg-gray-2 hover:text-dark dark:text-gray-5 dark:hover:bg-white/10 dark:hover:text-white"
                    }`}
                >Тархаах хуваарь</div>
              </Link>
            </div>
          </nav>
        </div>
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 xl:py-10">
          <DarkModeSwitcher />
        </div>
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 xl:py-10">
          <button className="flex w-full items-center gap-2.5 rounded-[7px] p-2.5 text-sm font-medium duration-300 ease-in-out hover:bg-red-light-2 hover:text-white dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white lg:text-base text-gray-6 border"
            onClick={() => { signOut() }}
          >
            <LogoutOutlined />
            Гарах
          </button>
        </div>
      </aside>
    </>
  );
}
