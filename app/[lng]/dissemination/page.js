"use client"
import React, { useState } from 'react';
import Layout from '@/components/baseLayout';
import "@/components/styles/dissemination-list.scss";

export default function AboutUs({ params: { lng } }) {

    return (
        <Layout lng={lng}>
            <div className="nso_statistic_section">
                <div className="nso_statistic_news">
                    <div className="nso_container">
                        <div className="__statistic_groups w-full">
                            <div className="nso_tab">
                                <div className="__header">
                                    <div className="__section">
                                        <div className="p-tabmenu p-component">
                                            <ul className="p-tabmenu-nav p-reset flex">
                                                <li className="p-tabmenuitem p-highlight">
                                                    <div className="p-menuitem-link p-ripple">
                                                        <div className="ng-star-inserted">Удахгүй гарах</div>
                                                    </div>
                                                </li>
                                                <li className="p-tabmenuitem">
                                                    <div className="p-menuitem-link p-ripple">
                                                        <div className="ng-star-inserted">Сүүлд гарсан</div>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="nso_tab_content">
                                    <div className="__table">
                                        <div className='p-datatable-wrapper'>
                                            <table className='w-full'>
                                                <thead className='p-datatable-thead'>
                                                    <tr className='__mobile_table'>
                                                        <th style={{ width: "15%" }}>Хамрах хүрээ</th>
                                                        <th style={{ width: "60%" }}>Танилцуулгын нэр</th>
                                                        <th style={{ width: "15%" }}>Тархаах өдөр	</th>
                                                        <th style={{ width: "10%" }}>Цаг</th>
                                                    </tr>
                                                </thead>
                                                <tbody className='p-datatable-tbody'>
                                                    <tr>
                                                        <td>2024 VII - IX</td>
                                                        <td>
                                                            Барилгын өртгийн индекс, 2024 оны 3 дугаар улиралд
                                                            <div class="__table_spec">
                                                                <span>
                                                                    2024-10-17
                                                                </span>
                                                                <span class="__table_views">
                                                                    Хугацаа болоогүй
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            11-р сарын 06
                                                        </td>
                                                        <td>
                                                            17:30
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>2024 VII - IX</td>
                                                        <td>
                                                            Барилгын өртгийн индекс, 2024 оны 3 дугаар улиралд
                                                            <div class="__table_spec">
                                                                <span>
                                                                    2024-10-17
                                                                </span>
                                                                <span class="__table_views">
                                                                    Хугацаа болоогүй
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            11-р сарын 06
                                                        </td>
                                                        <td>
                                                            17:30
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>2024 VII - IX</td>
                                                        <td>
                                                            Барилгын өртгийн индекс, 2024 оны 3 дугаар улиралд
                                                            <div class="__table_spec">
                                                                <span>
                                                                    2024-10-17
                                                                </span>
                                                                <span class="__table_views">
                                                                    Хугацаа болоогүй
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            11-р сарын 06
                                                        </td>
                                                        <td>
                                                            17:30
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>2024 VII - IX</td>
                                                        <td>
                                                            Барилгын өртгийн индекс, 2024 оны 3 дугаар улиралд
                                                            <div class="__table_spec">
                                                                <span>
                                                                    2024-10-17
                                                                </span>
                                                                <span class="__table_views">
                                                                    Хугацаа болоогүй
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            11-р сарын 06
                                                        </td>
                                                        <td>
                                                            17:30
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>2024 VII - IX</td>
                                                        <td>
                                                            Барилгын өртгийн индекс, 2024 оны 3 дугаар улиралд
                                                            <div class="__table_spec">
                                                                <span>
                                                                    2024-10-17
                                                                </span>
                                                                <span class="__table_views">
                                                                    Хугацаа болоогүй
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            11-р сарын 06
                                                        </td>
                                                        <td>
                                                            17:30
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>2024 VII - IX</td>
                                                        <td>
                                                            Барилгын өртгийн индекс, 2024 оны 3 дугаар улиралд
                                                            <div class="__table_spec">
                                                                <span>
                                                                    2024-10-17
                                                                </span>
                                                                <span class="__table_views">
                                                                    Хугацаа болоогүй
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            11-р сарын 06
                                                        </td>
                                                        <td>
                                                            17:30
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <div className="__pagination">
                                                <span>
                                                    Нийт
                                                    <strong>{" 32 "}</strong>
                                                    илэрцээс 
                                                    10
                                                    илэрц үзүүлж байна
                                                    <span class="__pagination_text">*Тухайн цаг үеийн байдлаас шалтгаалж тархаах өдөр цагт өөрчлөлт орно.</span>
                                                </span>
                                                {/* <app-pagination [pagination]="pagination"></app-pagination> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout >
    );
}
