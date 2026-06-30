"use client"
import React, { use } from 'react';
import CarouselNews from '@/components/home/CarouselNews';
import CarouselTender from '@/components/home/CarouselTender';
import CarouselMedia from '@/components/home/CarouselMedia';
import ContactSourceCard from '@/components/contact/ContactSourceCard';
import '@/components/styles/contact-us.scss';

export default function Home(props) {
    const {
        lng
    } = use(props.params);

    return (
        <>
            <CarouselNews lng={lng} />
            <br />
            {lng === "mn" && <CarouselMedia lng={lng} />}
            <br />
            {lng === "mn" && <CarouselTender lng={lng} />}
            <br />
            <div className="nso_container">
                <div className="page_source_section">
                    <ContactSourceCard lng={lng} sourceKey="aboutUsSource" />
                </div>
            </div>
        </>
    );
}
