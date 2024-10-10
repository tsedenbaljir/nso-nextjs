import React from 'react';
import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';

export default function baseLayout({ children, lng }) {
    return (
        <>
            <Header lng={lng} />
            {children}
            <Footer lng={lng} />
        </>
    );
}
