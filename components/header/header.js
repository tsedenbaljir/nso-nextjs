"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Path } from '@/utils/path';
import { useRouter } from "next/navigation";
import Submenu from '../menus/submenu/index';
import { PanelMenu } from "primereact/panelmenu";
import OneField from '@/components/Loading/OneField/Index';

const Header = ({ lng }) => {

    var pth = Path();
    const router = useRouter();

    const [selectedMenu, setSelectedMenu] = useState(null);
    const [menuShow, setMenuShow] = useState(false);
    const [menus, setMenus] = useState([]);
    const [menusMobile, setMenusMobile] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showUp, setShowUp] = useState(null);

    const [menusSub, setMenusSub] = useState([]);
    const [loadingSub, setLoadingSub] = useState(false);

    const [verticalOffset, setVerticalOffset] = useState(0);
    const [isShowMobile, setIsShowMobile] = useState(false);

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
        const fetchMenusSub = async () => {
            try {
                const response = await fetch('/api/menus/admin');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const res = await response.json();
                const filteredMenus = res.data.filter(menu =>
                    menu.category_id === 4 &&
                    menu.is_active === true
                );
                setMenusSub(filteredMenus);
                setLoadingSub(true);
            } catch (error) {
                console.error('Error fetching menus:', error);
            }
        };

        fetchMenusSub();

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
                    !menu.parent_id
                );

                // Get all submenus
                const subMenus = res.data.filter(menu =>
                    menu.category_id === 2 &&
                    menu.is_active === true &&
                    menu.parent_id
                );

                const subMenusTools = res.data.filter(menu =>
                    menu.is_active === true
                );

                // Attach submenus to their parent menus
                const menusWithSubs = mainMenus.map(menu => ({
                    ...menu,
                    subMenus: subMenus.filter(sub => sub.parent_id === menu.id).map(sub => ({
                        ...sub,
                        subway: subMenusTools.filter(tool => tool.parent_id === sub.id)
                    }))
                }));
                // mobile menu
                const menuWithSubcategories = await Promise.all(
                    menusWithSubs.map(async (category) => {
                        return {
                            label: lng === 'mn' ? category.name_mn : category.name_en,
                            id: category.id,
                            items: category.subMenus.length > 0 && category.subMenus.map((item) => ({
                                id: item.id,
                                label: lng === 'mn' ? item.name_mn : item.name_en,
                                items: item.subway.length > 0 && item.subway.map((subs) => ({
                                    id: subs.id,
                                    label: lng === 'mn' ? subs.name_mn : subs.name_en,
                                    command: () => {
                                        router.push(`/${lng}/${subs.url}`);
                                    }
                                })),
                            })),
                            command: () => {
                                if (category?.url)
                                    router.push(`/${lng}/${category?.url}`);
                            }
                        };
                    })
                );
                // mobile menu set
                setMenusMobile(menuWithSubcategories)
                // desktop menu set
                setMenus(menusWithSubs);
                setLoading(true);
            } catch (error) {
                console.error('Error fetching menus:', error);
            }
        };

        fetchMenus();
    }, []);

    const setDropDownActive = (menuId, index) => {
        const selectedSubMenu = menus.find(e => e.id === menuId)?.subMenus;

        if (selectedMenu === selectedSubMenu) {
            // If clicking the same menu, close it
            setShowUp(null);
            setMenuShow(false);
            setSelectedMenu(null);
        } else {
            // If clicking a different menu, show its submenus
            setShowUp(index)
            setMenuShow(true);
            setSelectedMenu(selectedSubMenu);
        }
    };

    const setDropDownClose = () => {
        setMenuShow(!menuShow)
        setShowUp(null);
        setMenuShow(false);
        setSelectedMenu(null);
    };

    const Dropdown = ({ menu, lng, pth, index }) => {
        return (
            <li key={menu.id} className="dropdown">
                {menu.url !== "" ? (
                    <Link
                        className={`${pth.includes(menu.url) && 'active-link'} __stat_cat_title cursor-pointer`}
                        href={menu.url}
                    >
                        {lng === 'mn' ? menu.name_mn : menu.name_en}
                    </Link>
                ) : (
                    <div className={`${pth.includes(menu.path) && 'active-link'} __stat_cat_title cursor-pointer`}
                        onClick={() => {
                            setDropDownActive(menu.id, index)
                        }}
                    >
                        {lng === 'mn' ? menu.name_mn : menu.name_en}
                        <i className={`pi pi-chevron-down ${showUp === index && 'up'}`}></i>
                    </div>
                )}
            </li>
        );
    };

    const onShowMobileMenu = () => {
        setIsShowMobile(!isShowMobile);
    }
    // Main menu component
    const MainMenu = ({ menus, loading, lng, pth }) => {
        return (
            <div className="__menu">
                <a className={`__logo lg:col-3 md:col-3 sm:col-12 ${lng === "en" && '_en'}`} href='/'></a>
                <ul>
                    {loading ?
                        menus.map((menu, index) => (
                            <Dropdown
                                key={menu.id}
                                index={index}
                                menu={menu}
                                lng={lng}
                                pth={pth}
                            />
                        )) :
                        <>
                            <OneField /><OneField /><OneField /><OneField /><OneField />
                        </>
                    }
                </ul>
                <ul className="__mobile_menu">
                    <li>
                        {/* (click)="onShowMobileMenu($event)"  */}
                        <a className="__mobile_menu_bar icon" onClick={() => { onShowMobileMenu() }}></a>
                    </li>
                </ul>
            </div>
        );
    };

    return (
        <>
            <div className="nso_header">
                <Submenu lng={lng} />
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
                <div className={`__dropdown __mobile ${isShowMobile && 'show'}`}>
                    {loading && <PanelMenu model={menusMobile} className="w-full nso_cate_selection" />}
                    {loadingSub && menusSub.map((its) => {
                        return <div className='pt-4'>
                            <Link href={'/${lng}/' + its.url} className='font-semibold text-lg'>{its.name_mn}</Link>
                        </div>
                    })}
                </div>
                <div className={`__dropdown ${menuShow && 'show'}`}>
                    <div className="nso_container">
                        <div className="__groups">
                            {
                                selectedMenu && selectedMenu.sort((a, b) => a.list_order - b.list_order).map((dts, index) => {
                                    return <div className='__group' key={index}>
                                        <div className='__title'>
                                            <a href={dts.url} className='__stat_cat_title'>{dts.name_mn}</a>
                                        </div>

                                        <div className='__items'>
                                            {dts.subway.map((sw, idx) => {
                                                return <span key={idx}> <a href={sw.url} className='__stat_cat_title'>{sw.name_mn}</a></span>
                                            })}
                                        </div>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div>
                    <div className={`__drop_back ${menuShow && 'show'}`} onClick={() => { setDropDownClose() }}>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
