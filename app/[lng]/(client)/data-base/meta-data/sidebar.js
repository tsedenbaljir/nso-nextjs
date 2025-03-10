"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation"; // Adjusted to import useRouter correctly
import { PanelMenu } from "primereact/panelmenu";

export default function SideBar({ lng }) {
    const router = useRouter();

    const [menuItems, setMenuItems] = useState([]);
    // This useEffect will update the menu items whenever the route changes
    useEffect(() => {
        setMenuItems([
            {
                label: 'Бүлэг',
                id: 'group',
                items: [
                    {
                        label: 'Мэдээ, тооллого, судалгаа',
                        id: 'questionnaire',
                        className: window.location.pathname === `/${lng}/data-base/meta-data/questionnaire` ? 'active-link' : '',
                        command: () => {
                            router.push(`/${lng}/data-base/meta-data/questionnaire`);
                        }
                    },
                    {
                        label: 'Үзүүлэлт',
                        id: 'indicator',
                        className: window.location.pathname === `/${lng}/data-base/meta-data/indicator` ? 'active-link' : '',
                        command: () => {
                            router.push(`/${lng}/data-base/meta-data/indicator`);
                        }
                    },
                    {
                        label: 'Нэр, томьёоны тайлбар',
                        id: 'glossary',
                        className: window.location.pathname === `/${lng}/data-base/meta-data/glossary` ? 'active-link' : '',
                        command: () => {
                            router.push(`/${lng}/data-base/meta-data/glossary`);
                        }
                    },
                ],
                className: '',
                expanded: true
            }
        ]);
    }, [window.location.pathname]);

    return (
        <PanelMenu model={menuItems} className="w-full nso_cate_selection" />
    );
}
