"use client"
import React from 'react';
import MainArticle from '@/components/articles/MainArticle';

export default function Home({ params: { lng } }) {

    return (
        <div className="nso_about_us">
            <div className="nso_container">
                <div className="nso_statistic_category -mt-10" style={{ background: 'white' }}>
                    <MainArticle name={'Мэдээ, мэдээлэл'} path="TRANNEWS" mainPath="about-us/news" lng={lng} />
                </div>
            </div>
        </div>
    );
}
