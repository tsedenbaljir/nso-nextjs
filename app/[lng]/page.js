"use client"
import Layout from '@/components/baseLayout';
import HomeSection from '@/components/home/HomeSection';
import CarouselNews from '@/components/home/CarouselNews';
import CarouselMedia from '@/components/home/CarouselMedia';

export default function Home({ params: { lng } }) {
  return (
    <Layout lng={lng}>
      <HomeSection indicators={[]} covidInfo={[
        {
          "id": 3437452,
          "name": "Малын тоо*",
          "nameEng": "Livestock",
          "indicatorType": "livestock",
          "catalogueId": 573054,
          "indicator": 64.7,
          "indicatorPerc": 64.0,
          "measureType": "percent",
          "image": "tIvK--fOd--8ycP-bO-TwA_mR6_O7-w67Rma2T-r.png",
          "info": "сая",
          "infoEng": "million",
          "tableau": "statistic/statcate/573054/table-view/DT_NSO_1001_021V1",
          "tableauEng": null,
          "updatedDate": "2023-12-27T00:00:00Z"
        },
        {
          "id": 22559401,
          "name": "Өрхийн сарын дундаж орлого ",
          "nameEng": "Household income per month",
          "indicatorType": "population",
          "catalogueId": 573066,
          "indicator": 2.4,
          "indicatorPerc": 23.8,
          "measureType": "percent",
          "image": "C8zsoJj-hUPqh9QMei--gSM3iV90Mevvcwx3JK_k.png",
          "info": "сая",
          "infoEng": "million",
          "tableau": "statistic/statcate/573066/table-view/DT_NSO_1900_018V1",
          "tableauEng": null,
          "updatedDate": "2024-03-31T15:00:00Z"
        },
        {
          "id": 22559402,
          "name": "Голч цалин",
          "nameEng": "Median wage",
          "indicatorType": "unemployment",
          "catalogueId": 573055,
          "indicator": 1.8,
          "indicatorPerc": 0.0,
          "measureType": "percent",
          "image": "nqJR2_GZa-xH__pALoK_LomUPAXm-9lt-P76DSsS.png",
          "info": "сая ",
          "infoEng": "million",
          "tableau": "statistic/statcate/48171320/table-view/DT_NSO_0400_069V2",
          "tableauEng": null,
          "updatedDate": "2024-03-31T09:30:00Z"
        },
        {
          "id": 22559403,
          "name": "Ажиллах хүчний оролцоо",
          "nameEng": "Labour participation rate",
          "indicatorType": "unemployment",
          "catalogueId": 573055,
          "indicator": 59.4,
          "indicatorPerc": 1.8,
          "measureType": "percent",
          "image": "6ULXrEi2_5d0-UAql-_DYpEx-Dn3TMi4rw6-pG-6.png",
          "info": "%",
          "infoEng": "%",
          "tableau": "statistic/statcate/573055/table-view/DT_NSO_0400_018V1",
          "tableauEng": null,
          "updatedDate": "2024-03-31T15:00:00Z"
        }
      ]} searchData={[]} lng={lng} />
      <CarouselNews />
      <CarouselMedia />
    </Layout>
  );
}
