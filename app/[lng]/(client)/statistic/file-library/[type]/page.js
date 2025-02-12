"use client";
import List from "../../list";
import Sidebar from "../../sidebar";

export default function StateCate({ params: { lng }, params }) {
    const { type } = params;
    return (
        <div className="nso_container statisctic_body">
            {/* Sidebar */}
            <div className="nso_cate_section mt-60 left-bar">
                <div className='__cate_groups'>
                    <Sidebar lng={lng} type={type} />
                </div>
            </div>
            {/* Main Content */}
            <List lng={lng} type={type} />
        </div>
    );
}
