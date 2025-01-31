"use client";
import Tabs from "../../tabs";
import Sidebar from "../../sidebar";

export default function StateCate({ params }) {
    const { sector, subsector } = params;

    return (
        <div className="nso_container ">
            {/* Sidebar */}
            <div className="nso_cate_section left-bar">
                <div className='__cate_groups'>
                    <Sidebar subsector={subsector} />
                </div>
            </div>
            {/* Main Content */}
            <Tabs sector={sector} subsector={subsector} />
        </div>
    );
}
