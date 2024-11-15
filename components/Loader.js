"use client";

import React from 'react';
import { Spin } from 'antd';

export default function Loader({ text = "Уншиж байна..." }) {
    return (
        <div className="loader-overlay">
            <div className="loader-content">
                <Spin size="large" />
                <div className="mt-4">{text}</div>
            </div>
            <style jsx>{`
                .loader-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    backdrop-filter: blur(5px);
                }
                .loader-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
            `}</style>
        </div>
    );
}
