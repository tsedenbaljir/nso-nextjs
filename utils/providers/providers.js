"use client"
import React from 'react'
// import { UserProvider } from "@/utils/contexts/Context";
import AuthProvider from './AuthProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { PrimeReactProvider } from 'primereact/api';
import { LoadingContext } from '@/utils/contexts/LoadingContext';

function Providers({ children }) {
    return (
        <LoadingContext>
            <PrimeReactProvider>
                <AuthProvider>
                    <AntdRegistry>
                        {/* <UserProvider> */}
                        {children}
                        {/* </UserProvider> */}
                    </AntdRegistry>
                </AuthProvider>
            </PrimeReactProvider>
        </LoadingContext>
    );
}

export default Providers;