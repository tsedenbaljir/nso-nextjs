import React from 'react';
import { useRouter } from "next/navigation";
import { useTranslation } from '@/app/i18n/client';

export default function Main({ children, type, lng }) {
    const router = useRouter();
    const { t } = useTranslation(lng, "lng", "");

    return (
        <div className="nso_tab">
            <div className="__header">
                <div className="__section">
                    <div className="p-tabmenu p-component">
                        <ul className="p-tabmenu-nav p-reset flex">
                            <li style={{fontFamily:'sans-serif'}} className={`p-tabmenuitem ${type === "future" && 'p-highlight'} cursor-pointer`}
                                onClick={() => {
                                    router.push("/dissemination/future")
                                }}>
                                <div className="p-menuitem-link p-ripple">
                                    <div className="ng-star-inserted ">{t('news.future')}</div>
                                </div>
                            </li>
                            <li className={`p-tabmenuitem ${type === "latest" && 'p-highlight'} cursor-pointer`}
                                onClick={() => {
                                    router.push("/dissemination/latest")
                                }}>
                                <div className="p-menuitem-link p-ripple">
                                    <div className="ng-star-inserted">{t('news.latest')}</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="nso_tab_content">
                <div className="__table">
                    <div className='p-datatable-wrapper'>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
