"use client"
import Path from '@/components/path/Index';
import { useTranslation } from '@/app/i18n/client';

export default function Layout({ children, params:{lng} }) {
  const { t } = useTranslation(lng, "lng", "");

  const breadMap = [
    { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
    { label: t('statCate.methodologyText'), url: [lng === 'mn' ? '/mn/methodology/list' : '/en/methodology/list'] }
  ];

  return (
    <div className="nso_statistic_section">
      <Path name={t('statCate.methodologyText')} breadMap={breadMap} />
      {children}
    </div>
  );
}
