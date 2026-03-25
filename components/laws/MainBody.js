import React from 'react';
import { useRouter } from "next/navigation";

export default function Body({ dt }) {
    const router = useRouter();
    return (
        <div
            className="__post"
            target="blank"
            onClick={() => {
                router.push(dt.file_path);
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
                <div className="__view_comments">
                    <span className="__date text-gray-5 text-sm ml-2">{dt.created_date.substr(0, 10)}</span>
                </div>
            </div>
            <img
                className="__download_cloud"
                src="/images/about_us/download-cloud.png"
            />
        </div>
    );
}
