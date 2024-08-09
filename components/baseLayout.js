import React from 'react';
import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';

export default function baseLayout({ children, lng }) {
    return (
        <>
            <Header lng={lng} />
            <div className="nso_main_section">
                <div className="nso_container" style={{ marginTop: 170 }}>
                    {children}
                </div>
            </div>
            <Footer lng={lng} />
        </>
    );
}
