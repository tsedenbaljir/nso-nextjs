"use client"
import Layout from '@/components/baseLayout';
import Sector from '@/components/home/Sector/Index';
import HomeSection from '@/components/home/HomeSection';
import CarouselNews from '@/components/home/CarouselNews';
import DisseminationHome from '@/components/home/disshome/home';

export default function Home({ params: { lng } }) {
  return (
    <Layout lng={lng}>
      <HomeSection indicators={[]} searchData={[]} lng={lng} />
      <Sector lng={lng} />
      {/* <DisseminationHome lng={lng} /> */}
      <CarouselNews lng={lng} />
      <br/>
    </Layout>
  );
}
