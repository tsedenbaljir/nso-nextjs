"use client";
import Tabs from "../../../tabs";
import Sidebar from "../../../sidebar";

export default function StateCate({ params: { lng }, params }) {
    const { tabs, sector, subsector } = params;
    
    return (
        <div className="nso_container statisctic_body">
            {/* Sidebar */}
            <div className="nso_cate_section left-bar">
                <div className='__cate_groups'>
                    <Sidebar subsector={subsector} lng={lng} />
                </div>
            </div>
            {/* Main Content */}
            <Tabs tabs={tabs} sector={sector} subsector={subsector} lng={lng} />
        </div>
    );
}
