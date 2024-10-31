import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function Articles({ article }) {

    return (
        <div className="__about_post" >
            <div className="__info_detail_page" >
                <div>
                    <img
                        className="__header_image"
                        src={`https://downloads.1212.mn/${article.header_image}`}
                    />
                </div>
                <div className="__post_title" >
                    {article.name}
                </div >
                <div className="__info" >
                    <div className="__view_comments" >
                        <div className="__info" >
                            <span className="__view" >
                                <div className='ml-5'>
                                    <i className="pi pi-calendar-minus"></i>
                                    {article.created_date.substr(0, 10)}
                                </div >
                            </span >
                        </div >
                    </div >
                    <div className="__social" >
                        <div
                            id="__one"
                            className="one"
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}>
                                {article.body}
                            </ReactMarkdown>
                        </div >
                    </div >
                </div >
            </div >
        </div >
    );
}
