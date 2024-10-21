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
                            Articles.map((art) => (
                                <div className="__list" key={art.id}>
                                    <div className="__posts"
                                        onClick={() => {
                                            router.push(`/news/${art.documentId}`);  // Use the proper ID to navigate
                                        }}
                                    >
                                        <img
                                            className="__image"
                                            src={process.env.BACKEND_URL + art.cover.formats.thumbnail.url}
                                            alt={art.title}
                                        />
                                        <div className="__title overflow-hidden">
                                            <div className="line-clamp-2">
                                                {art.title}
                                            </div>
                                        </div>
                                        <div className="__view_comments">
                                            <div className="__info">
                                                <div className='ml-5'>
                                                    <i className="pi pi-calendar-minus"></i>
                                                    {art.createdAt.substr(0, 10)}
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
