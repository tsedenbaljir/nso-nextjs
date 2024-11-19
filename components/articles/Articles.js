import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function Articles({ article }) {

    return (
        <div className="__about_post">
            <div className="__info_detail_page" >
                <div className="bg-gray">
                    <img
                        className="__header_image"
                        src={`https://downloads.1212.mn/${article.headerImage}`}
                        alt="main-news"
                    />
                </div>
                <div className='__view_comments'>
                    <div className=" __info">
                        <i className="pi pi-calendar-minus"></i>
                        {article.createdDate.substr(0, 10)}
                    </div>
                </div>
                <div className="__post_title mt-3">
                    {article.name}
                </div>
                <div className="border-b border-blue-700 p-2 mb-3">
                </div>
                <div className="__info" >
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
            </div>
        </div>
    );
}
