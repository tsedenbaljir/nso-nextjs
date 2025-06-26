"use client"; // ✅ Ensure this runs on the client side

import React from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';

export default function Paths({ name, breadMap }) {

    return (
        <div className="nso_page_header">
            <div className="nso_container">
                <div className="__header">
                    <span className="__page_name">{name}</span>
                    <BreadCrumb model={breadMap}
                        className="text-sm whitespace-nowrap pr-2"
                        style={{
                            '--p-breadcrumb-item-margin': '0 0.25rem',
                            '--p-breadcrumb-item-padding': '0.25rem 0.25rem',
                        }} />
                </div>
            </div>
        </div>
    );
}
