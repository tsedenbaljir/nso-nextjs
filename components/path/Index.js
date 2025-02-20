"use client"; // ✅ Ensure this runs on the client side

import React from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';

export default function Paths({ name, breadMap }) {

    return (
        <>
            <div className="nso_page_header">
                <div className="nso_container">
                    <div className="__header">
                        <span className="__page_name">{name}</span>
                        <BreadCrumb model={breadMap} />
                    </div>
                </div>
            </div>
        </>
    );
}
