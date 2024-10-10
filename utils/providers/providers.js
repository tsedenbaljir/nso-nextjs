"use client"
import React from 'react'
// import { UserProvider } from "@/utils/contexts/Context";
import AuthProvider from './AuthProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { PrimeReactProvider } from 'primereact/api';

function Providers({ children }) {
    return (
        <PrimeReactProvider>
            <AuthProvider>
                <AntdRegistry>
                    {/* <UserProvider> */}
                    {children}
                    {/* </UserProvider> */}
                </AntdRegistry>
            </AuthProvider>
        </PrimeReactProvider>
    );
}

export default Providers;