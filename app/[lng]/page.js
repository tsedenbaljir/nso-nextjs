"use client"
import Layout from '@/components/baseLayout';
import HomeSection from '@/components/home/HomeSection';
import CarouselNews from '@/components/home/CarouselNews';
import CarouselMedia from '@/components/home/CarouselMedia';

export default function Home({ params: { lng } }) {
  return (
    <Layout lng={lng}>
      <HomeSection indicators={[]} searchData={[]} lng={lng} />
      <CarouselNews />
      <CarouselMedia />
    </Layout>
  );
}
