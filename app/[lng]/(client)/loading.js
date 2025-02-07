"use client"
import React from 'react';
import { Spin } from 'antd';  // Import Ant Design's Spin component

export default function Loading() {
    return (
        <div className='nso_about_us'>
            <div className='flex items-center justify-center min-h-screen z-999999'>
                <div className='nso_container text-center items-center justify-center'>
                    <div className="mt-4 text-lg">Уншиж байна...</div>
                    <Spin size="large" />
                </div>
            </div>
        </div>
    );
}
