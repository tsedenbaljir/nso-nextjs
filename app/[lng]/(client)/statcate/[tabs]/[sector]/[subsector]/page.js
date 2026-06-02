"use client";;
import { use } from "react";
import Tabs from "../../../tabs";
import Sidebar from "../../../sidebar";

export default function StateCate(props) {
    const params = use(props.params);
    const { tabs, sector, subsector, lng } = params;

    if (decodeURIComponent(sector) === "Historical data" && tabs === "report") {
        return <div className="nso_container">
            <Tabs tabs={tabs} sector={sector} subsector={subsector} lng={lng} />
        </div>
    }

    return (
        <div className="nso_container statisctic_body">
            {/* Sidebar */}
            <div className="nso_cate_section left-bar">
                <div className='__cate_groups'>
                    <Sidebar sector={sector} subsector={subsector} lng={lng} />
                </div>
            </div>
            {/* Main Content */}
            <Tabs tabs={tabs} sector={sector} subsector={subsector} lng={lng} />
        </div>
    );
}
