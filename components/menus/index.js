import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Path } from '@/utils/path';
import { useRouter } from "next/navigation";
import { useTranslation } from '@/app/i18n/client';
import OneField from '@/components/Loading/OneField/Index';
import { PanelMenu } from 'primereact/panelmenu';

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
  const [mobileMenus, setMobileMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    "Bearer 82d1546606040d636ba3984d107e0e7b943b5b7484889d95216ae6709556c7201f0c1d3b74119ce25f025143e4f904aaf33943021f659db9c664c96b15bcf75825a79c7c4bed30cd69fa7a7818e781043e458c62ced21b433b0662ac4ea7159ddfd475d6cd36d30e176f028ca02f386d0ad2568a76a84dfd52911f615aba6b28"
  );

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow',
  };

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch(`https://medee.nso.mn/api/czesnij-tohirgoos/eabubq9bu38wbvfk84u8wcm1?populate[Menus][populate][subMenu][populate]=*`, {
          ...requestOptions,
          cache: 'no-store',  // Prevents caching
        });

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
        const MobileMenus = res.data.Menus
          .filter(menu => menu.IsActive === true)
          .map((menu, index) => ({
            template: (options) => (
              <div
                className={`p-panelmenu-header-link __stat_cat_title mt-3`}
              >
                <span className={`p-panelmenu-icon pi ${options.expanded ? 'pi-chevron-down' : 'pi-chevron-right'}`}></span>
                <div className='uppercase font-medium'>
                  {lng === "mn" ? menu.name : menu.enName}
                </div>
              </div>
            ),
            items: menu.subMenu
              .filter(sub => sub.IsActive === true)
              .map(dt => ({
                label: lng === "mn" ? dt.name : dt.enName,
                url: dt.url,
              })),
          }));

        setMobileMenus(MobileMenus)
        setLoading(true);
      } catch (error) {
        console.error('Error fetching menus:', error);
      }
    };

    fetchMenus();
  }, []);

  const [menusTop, setMenusTop] = useState([]);
  const [loadingTop, setLoadingTop] = useState(false);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/czesnij-tohirgoos/jo702rceqsu6onv0tif6zd4v?populate[Menus][populate][populate]=*`, {
          ...requestOptions,
          cache: 'no-store',  // Prevents caching
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const res = await response.json();

        const filteredMenus = res.data.Menus;

        setMenusTop(filteredMenus);
        setLoadingTop(true);
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
              {loading ? menus.map((dt, idx) => (
                <li key={idx} className="dropdown">
                  {dt.url ? (
                    <Link className={`${pth === dt.url && 'active-link'} __stat_cat_title`} href={dt.url}>
                      {lng === 'en' ? dt.enName : dt.name}
                    </Link>
                  ) : (
                    <div className={`${pth.includes(dt.path) && 'active-link'} __stat_cat_title`}>
                      {lng === 'en' ? dt.enName : dt.name}
                    </div>
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
              )) : <>
                <OneField /><OneField /><OneField />
              </>}
            </ul>
            <ul className="__mobile_menu">
              <li>
                <a onClick={() => { setShowMenu(!showMenu) }} className="__mobile_menu_bar icon"></a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={`__dropdown __mobile ${showMenu && "show"}`}>
        {loading && <PanelMenu model={mobileMenus} className="w-full md:w-20rem" />}
        {loadingTop ?
          menusTop.map((dt, index) => {
            return <>
              <div className={`p-panelmenu-header-link __stat_cat_title mt-3`}>
                <div key={index} className={`uppercase font-medium`}>
                  <Link className="uppercase font-medium" href={dt.url ? dt.url : "#"}>
                    {lng === 'mn' ? dt.name : dt.enName}
                  </Link>
                </div>
              </div>
            </>
          }) : <div>
            <OneField /><OneField /><OneField />
          </div>
        }
      </div >
    </>
  );
}
