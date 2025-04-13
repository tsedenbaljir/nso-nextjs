import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Path } from '@/utils/path';
import OneField from '@/components/Loading/OneField/Index';

// Dropdown component for submenu
const Dropdown = ({ menu, lng, pth }) => {
  return (
    <li key={menu.id} className="dropdown">
      {menu.url ? (
        <Link
          className={`${pth.includes(menu.url) && 'active-link'} __stat_cat_title`}
          href={menu.url}
        >
          {lng === 'mn' ? menu.name_mn : menu.name_en}
        </Link>
      ) : (
        <div className={`${pth.includes(menu.path) && 'active-link'} __stat_cat_title`}>
          {lng === 'mn' ? menu.name_mn : menu.name_en}
        </div>
      )}
      {menu.subMenus && menu.subMenus.length > 0 && (
        <div className="dropdown-content">
          <span>
            {menu.subMenus.map((submenu) => (
              submenu.url ? (
                <Link key={submenu.id} href={submenu.url}>
                  {lng === 'mn' ? submenu.name_mn : submenu.name_en}
                </Link>
              ) : null
            ))}
          </span>
        </div>
      )}
    </li>
  );
};

// Main menu component
const MainMenu = ({ menus, loading, lng, pth }) => {
  return (
    <div className="__menu">
      <Link className={`__logo lg:col-3 md:col-3 sm:col-12 ${lng === "en" && '_en'}`} href='/'></Link>
      <ul>
        {loading ?
          menus.map((menu) => (
            <Dropdown
              key={menu.id}
              menu={menu}
              lng={lng}
              pth={pth}
            />
          )) :
          <>
            <OneField /><OneField /><OneField />
          </>
        }
      </ul>
    </div>
  );
};

// Main component
export default function Index({ lng }) {
  var pth = Path();
  const [mounted, setMounted] = useState(false);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch('/api/menus/admin');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const res = await response.json();

        // Get main menus with category_id = 2
        const mainMenus = res.data.filter(menu =>
          menu.category_id === 2 &&
          menu.is_active === true &&
          !menu.parent_id  // Only get top-level menus
        );

        // Get all submenus
        const subMenus = res.data.filter(menu =>
          menu.category_id === 2 &&
          menu.is_active === true &&
          menu.parent_id  // Only get menus with parent_id
        );

        // Attach submenus to their parent menus
        const menusWithSubs = mainMenus.map(menu => ({
          ...menu,
          subMenus: subMenus.filter(sub => sub.parent_id === menu.id)
        }));

        setMenus(menusWithSubs);
        setLoading(true);
      } catch (error) {
        console.error('Error fetching menus:', error);
      }
    };

    fetchMenus();
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`__main_header ${verticalOffset && 'small'}`}>
      <div className="nso_container">
        <MainMenu
          menus={menus}
          loading={loading}
          lng={lng}
          pth={pth}
        />
      </div>
    </div>
  );
}
