import React from 'react';
import { useTranslation } from '@/app/i18n/client'
import Link from 'next/link';

export default function Index({ lng }) {
    const { t } = useTranslation(lng, "lng", "");
    return (
        <>

            <div className={`__main_header`}>
                <div className="nso_container">
                    <div className="__menu">
                        <Link className="__logo lg:col-3 md:col-3 sm:col-12" href='/'></Link>
                        <ul>
                            <li>
                                <Link className="active-link __stat_cat_title"
                                    href=''>{t('home')}
                                </Link>
                            </li>
                            <li>
                                <Link className="__stat_cat_title"
                                    href=''>{t('menuAboutUs.cooperation')}
                                </Link>
                            </li>
                            <li>
                                <Link className="__stat_cat_title"
                                    href=''>{t('menuAboutUs.workspace')}
                                </Link>
                            </li>
                            <li>
                                <Link className="__stat_cat_title"
                                    href=''>{t('menuAboutUs.news')}
                                </Link>
                            </li>
                            <li>
                                <Link className="__stat_cat_title"
                                    href=''
                                >{t('menuAboutUs.legal')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
