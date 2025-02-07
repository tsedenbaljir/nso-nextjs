"use client"
import React from 'react';
import Layout from '@/components/baseLayout';
import { useTranslation } from '@/app/i18n/client';
import MainArticle from '@/components/articles/MainArticle';

export default function Home({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");

    return (
        <>
            <MainArticle name={t('MEDIANEWS')} path="media" mainPath="news" lng={lng} />
        </>
    );
}
