"use client"
import ServiceGrid from '@/components/home/ServiceGrid';
import { useTranslation } from '@/app/i18n/client';
import { 
  HomeOutlined, 
  BarChartOutlined, 
  NotificationOutlined,
  BookOutlined,
  DatabaseOutlined,
  ApiOutlined,
  FileTextOutlined,
  SmileOutlined,
  TeamOutlined
} from '@ant-design/icons';

export default function Home({ params: { lng } }) {
  const { t } = useTranslation(lng, "lng", "");

  const services = [
    {
      id: 1,
      icon: <HomeOutlined style={{ fontSize: '28px' }} />,
      title: t('mainWelcome.mainSite'),
      link: '/home'
    },
    {
      id: 2,
      icon: <BarChartOutlined style={{ fontSize: '28px' }} />,
      title: t('mainWelcome.statistics'),
      link: 'http://10.0.1.55/pxweb/pxweb/mn/NSO/'
    },
    {
      id: 3,
      icon: <NotificationOutlined style={{ fontSize: '28px' }} />,
      title: t('mainWelcome.news'),
      link: '/news/latest'
    },
    {
      id: 4,
      icon: <BookOutlined style={{ fontSize: '28px' }} />,
      title: t('mainWelcome.publications'),
      link: '/publications'
    },
    {
      id: 5,
      icon: <DatabaseOutlined style={{ fontSize: '28px' }} />,
      title: t('mainWelcome.dataNation'),
      link: 'https://data.nso.mn'
    },
    {
      id: 6,
      icon: <ApiOutlined style={{ fontSize: '28px' }} />,
      title: t('mainWelcome.metaData'),
      link: 'https://metadata.nso.mn'
    },
    {
      id: 7,
      icon: <FileTextOutlined style={{ fontSize: '28px' }} />,
      title: t('mainWelcome.reports'),
      link: '/dissemination/future'
    },
    {
      id: 8,
      icon: <SmileOutlined style={{ fontSize: '28px' }} />,
      title: t('funStatistic.name'),
      link: 'http://funstatistic.app.nso.mn'
    },
    {
      id: 9,
      icon: <TeamOutlined style={{ fontSize: '28px' }} />,
      title: t('menuAboutUs.workspace'),
      link: '/workspace'
    }
  ];

  return (
    <div className="home-container">
      <div className="nso_container">
        <div className="home-content py-22">
          <div className="logo-section">
            <img src="/logo.png" alt="Logo" className="main-logo" />
          </div>
          <ServiceGrid services={services} />
        </div>
      </div>
    </div>
  );
}
