import React from 'react';
import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';
import MainContentOffset from '@/components/baseLayout/MainContentOffset';
import { MetadataProvider } from '@/utils/contexts/Metadata';

export default function baseLayout({ children, lng }) {
    return (
        <>
            <Header lng={lng} />
            <MetadataProvider>
                <MainContentOffset>
                    {children}
                </MainContentOffset>
            </MetadataProvider>
            <Footer lng={lng} />
        </>
    );
}
