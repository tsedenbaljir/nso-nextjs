"use client"
import React from 'react'
// import { UserProvider } from "@/utils/contexts/Context";
import AuthProvider from './AuthProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';

function Providers({ children }) {
    return (
        <AuthProvider>
            <AntdRegistry>
                {/* <UserProvider> */}
                    {children}
                {/* </UserProvider> */}
            </AntdRegistry>
        </AuthProvider>
    );
}

export default Providers;