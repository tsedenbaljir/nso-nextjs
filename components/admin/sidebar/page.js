"use client"
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DarkModeSwitcher from './darkMode';
import { Path } from '@/utils/path';
import { signOut } from "next-auth/react";
import MenuItems from './MenuItems';
import { LogoutOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useRouter } from "next/navigation";

export default function Sidebar() {
  var pth = Path().split("/")[3];
  const router = useRouter();

  const handleElasticIndex = async () => {
    try {
      const response = await fetch('/api/elastic_index', {
        method: 'POST'
      });
      const result = await response.json();

      if (result.success) {
        message.success('Хайлт амжилттай индекслэгдлээ');
      } else {
        message.error(result.message || 'Алдаа гарлаа');
      }
    } catch (error) {
      console.error('Error indexing:', error);
      message.error('Индекслэх үед алдаа гарлаа');
    }
  };

  return (
    <>
      <aside className="absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden border-r border-stroke  dark:border-stroke-dark dark:bg-gray-dark lg:static lg:translate-x-0">
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 xl:py-10">
          <Link href="/admin/dashboard">
            <img
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
                <MenuItems name={"Үйл явдал"} isActive={pth === "news"} link={"news"} />
                <MenuItems name={"Тархаах хуваарь"} isActive={pth === "dissemination"} link={"dissemination"} />
                <MenuItems name={"Файл татах"} isActive={pth === "bulletin"} link={"bulletin"} />
                <MenuItems name={"Цэсний тохиргоо"} isActive={pth === "menus"} link={"menus"} />
                <MenuItems name={"Ажлын байр"} isActive={pth === "workspace"} link={"workspace"} />
                <MenuItems name={"Ил тод байдал"} isActive={pth === "transparency"} link={"transparency"} />
                <MenuItems name={"Хууль эрх зүй"} isActive={pth === "laws"} link={"laws"} />
                <MenuItems name={"Онцлох үзүүлэлт"} isActive={pth === "indicator"} link={"indicator"} />
                <MenuItems name={"Тайлан"} isActive={pth === "report"} link={"report"} />
                <MenuItems name={"Тайлан эмхэтгэл"} isActive={pth === "file-library"} link={"file-library"} />
                <MenuItems name={"Арга зүй"} isActive={pth === "methodology"} link={"methodology"} />
                <MenuItems name={"Холбоо барих"} isActive={pth === "contact-us"} link={"contact-us"} />
              </ul>
            </div>
            <div >
              <h3 className="mb-3 text-sm font-medium text-dark-4 dark:text-dark-6 border-b">
                ТУСЛАХ ЦЭС
              </h3>
              <ul className="mb-6 flex flex-col gap-2">
                <MenuItems name={"Нэр, томьёоны тайлбар"} isActive={pth === "glossary"} link={"glossary"} />
                <MenuItems name={"Санал хүсэлт"} isActive={pth === "contact"} link={"contact"} />
                <MenuItems name={"Цахим шуудан"} isActive={pth === "subscribeEmail"} link={"subscribeEmail"} />
                <li>
                  <div
                    className={`cursor-pointer relative flex rounded-[7px] px-3.5 py-2 font-medium duration-300 ease-in-out dark:bg-white/10 text-white bg-orange-500 hover:bg-orange-600`}
                    onClick={handleElasticIndex}
                  >
                    Хайлт индекслэх
                  </div>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 xl:py-10">
          <DarkModeSwitcher />
        </div>
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 xl:py-10">
          <button className="flex w-full items-center gap-2.5 rounded-[7px] p-2.5 text-sm font-medium duration-300 ease-in-out hover:bg-red-light-2 hover:text-white dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white lg:text-base text-gray-6 border"
            onClick={() => {
              signOut();
              router.push('/admin/login');
            }}
          >
            <LogoutOutlined />
            Гарах
          </button>
        </div>
      </aside>
    </>
  );
}
