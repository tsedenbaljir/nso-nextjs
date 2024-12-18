"use client"
import ServiceGrid from '@/components/home/ServiceGrid';
import { useTranslation } from '@/app/i18n/client';
import {
  HomeOutlined,
  BarChartOutlined,
  NotificationOutlined,
  BookOutlined,
  DatabaseOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  SmileOutlined,
  TeamOutlined
} from '@ant-design/icons';

export default function Home({ params: { lng } }) {
  const { t } = useTranslation(lng, "lng", "");

  const services = [
    {
      id: 1,
      icon: <HomeOutlined style={{ fontSize: '28px', color: '#0076de' }} />,
      title: t('mainWelcome.mainSite'),
      link: lng + '/home'
    },
    {
      id: 2,
      icon: <BarChartOutlined style={{ fontSize: '28px', color: '#0076de' }} />,
      title: t('mainWelcome.statistics'),
      link: 'http://10.0.1.55/pxweb/pxweb/mn/NSO/'
    },
    {
      id: 3,
      icon: <NotificationOutlined style={{ fontSize: '28px', color: '#0076de' }} />,
      title: t('mainWelcome.news'),
      link: lng + '/news/latest'
    },
    {
      id: 4,
      icon: <BookOutlined style={{ fontSize: '28px', color: '#0076de' }} />,
      title: t('mainWelcome.publications'),
      link: lng + '/dissemination/future'
    },
    {
      id: 5,
      icon: <DatabaseOutlined style={{ fontSize: '28px', color: '#0076de' }} />,
      title: t('mainWelcome.dataNation'),
      link: 'https://data.nso.mn'
    },
    {
      id: 6,
      icon: <FileSearchOutlined style={{ fontSize: '28px', color: '#0076de' }} />,
      title: t('mainWelcome.metaData'),
      link: 'https://metadata.nso.mn'
    },
    {
      id: 7,
      icon: <FileTextOutlined style={{ fontSize: '28px', color: '#0076de' }} />,
      title: t('TENDER'),
      link: lng + '/transparency/tender'
    },
    {
      id: 8,
      icon: <SmileOutlined style={{ fontSize: '28px', color: '#0076de' }} />,
      title: t('funStatistic.name'),
      link: 'http://funstatistic.app.nso.mn'
    },
    {
      id: 9,
      icon: <TeamOutlined style={{ fontSize: '28px', color: '#0076de' }} />,
      title: t('menuAboutUs.workspace'),
      link: lng + '/workspace'
    }
  ];

  return (
    <div className="home-container">
      <div className="nso_container">
        <div className="home-content py-22 w-full">
          <div className="logo-section">
            <img src="/logo.png" alt="Logo" className="main-logo" />
          </div>
          <ServiceGrid services={services} />
        </div>
      </div>
    </div>
  );
}
