import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function Articles({ article }) {
    
    return (
        <div className="__about_post">
            <div className="__info_detail_page for" >
                <div className="bg-gray">
                    {article.cover && <img
                        className="__header_image"
                        src={process.env.BACKEND_URL + article.cover.formats.large.url}
                    />}
                </div>
                <div className='__view_comments'>
                    <div className=" __info">
                        <i className="pi pi-calendar-minus"></i>
                        {article.createdAt.substr(0, 10)}
                    </div>
                </div>
                <div className="__post_title mt-3">
                    {article.title}
                </div>
                <div className="border-b border-blue-700 p-2 mb-5">
                </div>
                <div className="__info">
                    <div className="__social">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}>
                            {article.Content.replace(/\\r\\n|\\n|\\r/g, '<br/>')}
                        </ReactMarkdown>
                    </div>
                </div>
                <div className="__body"></div>
            </div>
        </div>
    );
}
