"use client"
import "@/components/styles/news.scss";
import Layout from '@/components/baseLayout';

export default function Home({ params: { lng } }) {
    return (
        <Layout lng={lng}>
            <div className='nso_main_section'>
                <div class="nso_container">
                    <div class="__about_post">
                        <div class="__info_detail_page for" >
                            <div>
                                <img
                                    class="__header_image"
                                    src="https://downloads.1212.mn/R-19k4geDBrmvme54Q_QPUeKmcQN9q4sqp-8tzhO.jpg"
                                />
                            </div>
                            <div class="__post_title">
                                tasdfadfasdfasdf
                            </div>
                            <div class="__info">
                                <div class="__view_comments">
                                    <div class="__info">
                                        <span class="__view"
                                        >1123
                                            <div className='mt-10'>
                                                <i class="pi pi-calendar-minus"></i>
                                                12 1212
                                            </div>
                                        </span>
                                    </div>
                                </div>
                                <div class="__social">
                                    <div
                                        id="__one"
                                        class="one"
                                    //   [innerHtml]="reAppBody(news.body) | safeHtml"
                                    ></div>
                                </div>
                            </div>
                            <div class="__body"></div>
                        </div>
                    </div>
                    <div class="__sidebar">
                        <div class="__about_post_sidebar">
                            <div class="__header">
                                <div class="__title">
                                    wtwet
                                </div>
                            </div>
                            <div class="__post">
                                <a
                                    class="__posts"
                                // *ngFor="let item of side_bar_news"
                                // [href]="'/' + lang + '/about-us/news/'+item.id"
                                >
                                    <img
                                        class="__header_image"
                                        width="100%"
                                        src="https://downloads.1212.mn/R-19k4geDBrmvme54Q_QPUeKmcQN9q4sqp-8tzhO.jpg"
                                    />
                                    <div class="__title">
                                        names
                                    </div>
                                    <div class="__view_comments">
                                        <div class="__info">
                                            <span class="__view">
                                                12
                                                <div className='mt-10'>
                                                    <i class="pi pi-calendar-minus"></i>
                                                    1231231
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
