import React from 'react';
import { useRouter } from "next/navigation";
import TextLoading from '@/components/Loading/Text/Index';

export default function Index({ Articles, loading }) {
    const router = useRouter();

    return (
        <>
            <div className="__post_all">
                <div className="_group_list_all">
                    {loading ? (
                        <div className='w-screen'>
                            <TextLoading />
                            <br />
                            <TextLoading />
                            <br />
                            <TextLoading />
                            <br />
                            <TextLoading />
                            <br />
                            <TextLoading />
                        </div>
                    ) : (
                        Articles.length > 0 ? (
                            Articles.map((art, index) => (
                                <div className="__list" key={index}>
                                    <div className="__posts"
                                        onClick={() => {
                                            router.push(`/news/${art.id}`);  // Use the proper ID to navigate
                                        }}
                                    >
                                        <img
                                            className="__image"
                                            width="100%"
                                            src={`https://downloads.1212.mn/${art.header_image}`}
                                            alt="main-news"
                                        />
                                        <div className="__title overflow-hidden">
                                            <div className="line-clamp-2">
                                                {art.name}
                                            </div>
                                        </div>
                                        <div className="__view_comments">
                                            <div className="__info">
                                                <div className='ml-5'>
                                                    <i className="pi pi-calendar-minus"></i>
                                                    {art.created_date.substr(0, 10)}
                                                </div>
                                                {/* <span className="__view">
                                                </span> */}
                                            </div>
                                        </div>
                                    </div>
                                    <br />
                                </div>
                            ))
                        ) : (
                            <div>Мэдээлэл олдсонгүй.</div>  // Display message if no articles are available
                        )
                    )}
                </div>
            </div>
        </>
    );
}
