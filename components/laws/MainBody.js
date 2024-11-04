import React from 'react';

export default function Body({ dt }) {
    return (
        <div
            className="__post"
            target="blank"
            onClick={() => {
                router.push("https://downloads.1212.mn/" + JSON.parse(dt.file_info).pathName);
            }}
        >
            <img
                src="/images/about_us/pdf-logo.png"
                style={{ width: "36px", height: "47px" }}
            />
            <div className="__laws-body">
                <div className="__title">
                    {dt.name}
                </div>
                <div className="__view_comments mt-3">
                    <span className="__date text-gray-5 text-sm">{dt.created_date.substr(0, 10)}</span>
                </div>
            </div>
            <img
                className="__download_cloud"
                src="/images/about_us/download-cloud.png"
            />
        </div>
    );
}
