"use client"
import React, { use } from 'react';
import CarouselNews from '@/components/home/CarouselNews';
import CarouselTender from '@/components/home/CarouselTender';
import CarouselMedia from '@/components/home/CarouselMedia';

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
        </>
    );
}
