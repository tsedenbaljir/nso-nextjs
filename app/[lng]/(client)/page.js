"use client"
import Sector from '@/components/home/Sector/Index';
import HomeSection from '@/components/home/HomeSection';
import CarouselNews from '@/components/home/CarouselNews';
import DisseminationHome from '@/components/home/disshome/home';
import ModalImages from "@/components/ModalImages";

export default function Home({ params: { lng } }) {
  return (
    <>
      <HomeSection indicators={[]} searchData={[]} lng={lng} />
      <Sector lng={lng} />
      <DisseminationHome lng={lng} />
      <CarouselNews lng={lng} />
      <br />

      <ModalImages />
    </>
  );
}
