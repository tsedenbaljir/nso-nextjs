import React from 'react';
import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';
import { MetadataProvider } from '@/utils/contexts/Metadata';

export default function baseLayout({ children, lng }) {
    return (
        <>
            <Header lng={lng} />
            <MetadataProvider>
                {children}
            </MetadataProvider>
            <Footer lng={lng} />
        </>
    );
}
