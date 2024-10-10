import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Path } from '@/utils/path';
import DropDown from '@/components/menus/dropDown';
import { useTranslation } from '@/app/i18n/client';

export default function Index({ lng }) {
  var pth = Path();
  const { t } = useTranslation(lng, "lng", "");
  const [verticalOffset, setVerticalOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const offset =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      setVerticalOffset(offset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const menus = [
    {
      name: t('aboutUs'),
      link: "/mn",
      subMenu: [
        {
          name: t('orgStructure'),
          link: "/mn",
        },
        {
          name: t('timeLine'),
          link: "/mn",
        }]
    },
    {
      name: t('menuAboutUs.cooperation'),
      link: "cooperation",
      subMenu: [
        {
          name: t('cooperationB'),
          link: "/mn",
        },
        {
          name: t('cooperationM'),
          link: "/mn",
        }]
    },
    {
      name: t('menuAboutUs.news'),
      link: "news",
      subMenu: [
        {
          name: t('LASTNEWS'),
          link: "/mn",
        },
        {
          name: t('MEDIANEWS'),
          link: "/mn",
        }]
    },
    {
      name: t('menuAboutUs.legal'),
      link: "https://1212.mn/",
      subMenu: [
        {
          name: t('legalMenu.Rules'),
          link: "/mn",
        },
        {
          name: t('legalMenu.Command'),
          link: "/mn",
        },
        {
          name: t('legalMenu.Documents'),
          link: "/mn",
        }]
    },
    {
      name: t('transparency'),
      link: "education",
      subMenu: [
        {
          name: "Хүний нөөц",
          link: "/mn",
        },
        {
          name: "Үйл ажиллагааны ил тод байдал",
          link: "/mn",
        },
        {
          name: "Авлигын эсрэг арга хэмжээ",
          link: "/mn",
        },
        {
          name: "Үйл ажиллагааны хөтөлбөр, тайлан",
          link: "/mn",
        },
        {
          name: "Төрийн албаны зөвлөлийн Үндэсний статистикийн хорооны дэргэдэх салбар зөвлөл",
          link: "/mn",
        },
        {
          name: "Тендэр",
          link: "/mn",
        }]
    },
  ]

  return (
    <>
      <div className={`__main_header ${verticalOffset && 'small'}`}>
        <div className="nso_container">
          <div className="__menu">
            <Link className="__logo lg:col-3 md:col-3 sm:col-12" href='/'></Link>
            <ul>
              {
                menus.map((dt, idx) => (
                  <li key={idx} className="dropdown">
                    <Link className={`${pth === dt.link && 'active-link'} __stat_cat_title`} href={"/" + dt.link}>
                      {dt.name}
                    </Link>
                    <div className="dropdown-content">
                      <span>
                        {dt?.subMenu?.map((sb) => (
                          <Link key={sb.name} className="" href={"/" + sb.link}>
                            {sb.name}
                          </Link>
                        ))}
                      </span>
                    </div>
                  </li>
                ))
              }
              {/* <DropDown lng={lng} /> */}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
