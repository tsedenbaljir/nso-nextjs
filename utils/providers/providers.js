"use client"
import './antdReact19Patch';
import AuthProvider from './AuthProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { PrimeReactProvider } from 'primereact/api';

function Providers({ children }) {
    return (
        <AuthProvider>
            <PrimeReactProvider>
                <AntdRegistry>
                    {children}
                </AntdRegistry>
            </PrimeReactProvider>
        </AuthProvider>
    );
}

export default Providers;