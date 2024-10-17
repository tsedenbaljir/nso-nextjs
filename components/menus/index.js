import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Path } from '@/utils/path';
import { useRouter } from "next/navigation";
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

  const router = useRouter();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);

  const myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    "Bearer " + process.env.BACKEND_KEY
  );

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/czesnij-tohirgoos/eabubq9bu38wbvfk84u8wcm1?populate[Menus][populate][subMenu][populate]=*`, requestOptions);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const res = await response.json();

        const filteredMenus = res.data.Menus
          .filter(menu => menu.IsActive === true)
          .map(menu => ({
            ...menu,
            subMenu: menu.subMenu.filter(sub => sub.IsActive === true)
          }));

        setMenus(filteredMenus);
        setLoading(true);
      } catch (error) {
        console.error('Error fetching menus:', error);
      }
    };

    fetchMenus();
  }, []);

  return (
    <>
      <div className={`__main_header ${verticalOffset && 'small'}`}>
        <div className="nso_container">
          <div className="__menu">
            <Link className="__logo lg:col-3 md:col-3 sm:col-12" href='/'></Link>
            <ul>
              {loading && menus.map((dt, idx) => (
                <li key={idx} className="dropdown">
                  {dt.url && (
                    <Link className={`${pth === dt.url && 'active-link'} __stat_cat_title`} href={dt.url}>
                      {lng === 'en' ? dt.enName : dt.name}
                    </Link>
                  )}
                  {dt.subMenu && dt.subMenu.length > 0 && (
                    <div className="dropdown-content">
                      <span>
                        {dt.subMenu.map((sb, sbIdx) => (
                          sb.url ? (
                            <Link key={sbIdx} href={sb.url}>
                              {lng === 'en' ? sb.enName : sb.name}
                            </Link>
                          ) : null
                        ))}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
