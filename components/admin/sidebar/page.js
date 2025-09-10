"use client"
import React from 'react';
import Link from 'next/link';
import { message } from 'antd';
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LogoutOutlined } from '@ant-design/icons';

import { Path } from '@/utils/path';
import MenuItems from './MenuItems';
import DarkModeSwitcher from './darkMode';

export default function Sidebar({ user, userstatus }) {
  var pth = Path().split("/")[3];
  const router = useRouter();

  const isAdmin =
    (typeof user?.role === 'string' && user.role.toLowerCase() === 'admin') ||
    user?.name === 'nso@dmin12';

  const normalize = (val) =>
    (val || '')
      .toString()
      .trim()
      .toLowerCase();

  const getAllowedSlugs = (roleValue) => {
    if (!roleValue) return [];
    if (Array.isArray(roleValue)) return roleValue.map(normalize);
    if (typeof roleValue === 'string') {
      // Try JSON first
      try {
        const parsed = JSON.parse(roleValue);
        if (Array.isArray(parsed)) return parsed.map(normalize);
        if (parsed && Array.isArray(parsed.allowed)) return parsed.allowed.map(normalize);
      } catch (_) {
        // Not JSON, treat as comma/space-separated list
      }
      return roleValue
        .split(/[\s,;|]+/)
        .filter(Boolean)
        .map(normalize);
    }
    return [];
  };

  const allowedSet = isAdmin ? null : new Set(getAllowedSlugs(user?.role));

  const mainMenus = [
    { name: "Үйл явдал", link: "news" },
    { name: "Тархаах хуваарь", link: "dissemination" },
    { name: "Файл татах", link: "bulletin" },
    { name: "Цэсний тохиргоо", link: "menus" },
    { name: "Ажлын байр", link: "workspace" },
    { name: "Ил тод байдал", link: "transparency" },
    { name: "Хууль эрх зүй", link: "laws" },
    { name: "Онцлох үзүүлэлт", link: "indicator" },
    // { name: "Мета өгөгдөл", link: "metadata" },
    { name: "Мэдээ, тооллого, судалгаа - Мета өгөгдөл", link: "metadata-questionnaire" },
    { name: "Тайлан", link: "report" },
    { name: "Тайлан эмхэтгэл", link: "file-library" },
    { name: "Арга зүй", link: "methodology" },
    { name: "Холбоо барих", link: "contact-us" },
    { name: "Хэрэглэгч нэмэх", link: "user-management" },
  ];

  const helperMenus = [
    { name: "Нэр, томьёоны тайлбар", link: "glossary" },
    { name: "Санал хүсэлт", link: "contact" },
    { name: "Цахим шуудан", link: "subscribeEmail" },
  ];

  const filterMenus = (items) =>
    isAdmin ? items : items.filter((item) => allowedSet?.has(normalize(item.link)));

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
                {filterMenus(mainMenus).map((item) => (
                  <MenuItems key={item.link} name={item.name} isActive={pth === item.link} link={item.link} />
                ))}
              </ul>
            </div>
            {isAdmin && (
              <div >
                <h3 className="mb-3 text-sm font-medium text-dark-4 dark:text-dark-6 border-b">
                  ТУСЛАХ ЦЭС
                </h3>
                <ul className="mb-6 flex flex-col gap-2">
                  {filterMenus(helperMenus).map((item) => (
                    <MenuItems key={item.link} name={item.name} isActive={pth === item.link} link={item.link} />
                  ))}
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
            )}
          </nav>
        </div>
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 xl:py-10">
          <DarkModeSwitcher />
        </div>
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 xl:py-10">
          <button className="flex w-full items-center gap-2.5 rounded-[7px] p-2.5 text-sm font-medium duration-300 ease-in-out hover:bg-red-light-2 hover:text-white dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white lg:text-base text-gray-6 border"
            onClick={() => {
              signOut();
              router.push('/login');
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
