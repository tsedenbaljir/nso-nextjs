"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TablesData from "./table/tables";
import MainIndicator from "./indicator/main";
import Report from "./reports/main";
import Methodology from "./methodology/main";
import Qualityreport from "./qualityreport/main";
import { TabView, TabPanel } from "primereact/tabview";
import LoadingDiv from '@/components/Loading/OneField/Index';

export default function Tabs({ lng, tabs, sector, subsector }) {
    const router = useRouter();

    // Function to determine the active tab index
    const getTabIndex = (tabs) => {
        switch (tabs) {
            case "table": return 0;
            case "indicator": return 1;
            case "report": return 2;
            case "methodology": return 3;
            case "qualityreport": return 4;
            default: return 0; // Default to "table"
        }
    };

    // Function to get the tab name from the index
    const getIndexTab = (index) => {
        switch (index) {
            case 0: return "table";
            case 1: return "indicator";
            case 2: return "report";
            case 3: return "methodology";
            case 4: return "qualityreport";
            default: return "table"; // Default to "table"
        }
    };

    // Set initial active tab
    const [activeIndex, setActiveIndex] = useState(getTabIndex(tabs));
    const [name, setName] = useState(null);

    useEffect(() => {
        // Fetch subcategories
        const fetchSubcategories = async (categoryId) => {
            try {
                const response = await fetch(`/api/subsectorname?subsectorname=${categoryId}&lng=${lng}`);
                const result = await response.json();
                setName(result.data.filter(e => e.id === decodeURIComponent(subsector)));

                if (!Array.isArray(result.data)) {
                    return [];
                }
            } catch (error) {
                return [];
            }
        };
        fetchSubcategories(decodeURIComponent(sector));

    }, [sector, subsector]);

    if (decodeURIComponent(sector) === "Historical data" && tabs === "report") {
        return <div id="stat_cate" className="nso_cate_body pl-0">
            {/* Title */}
            <span className="__cate_title">БНМАУ -ын тайлан</span>
            {/* PrimeReact Tabs */}
            <TabView
                activeIndex={0}
            >
                <TabPanel header={lng === "mn" ? "Тайлан" : "Report"}>
                    <Report sector={decodeURIComponent(sector)} subsector={subsector} lng={lng} />
                </TabPanel>
            </TabView>
        </div>
    }

    if (decodeURIComponent(sector) === "Historical data" && tabs === "table") {
        return <div id="stat_cate" className="nso_cate_body pl-0">
            {/* Title */}
            <span className="__cate_title">{name ? name[0]?.text : <LoadingDiv />}</span>
            {/* PrimeReact Tabs */}
            <TabView
                activeIndex={0}
            >
                <TabPanel header={lng === "mn" ? "Хүснэгт" : "Table"}>
                    <TablesData sector={sector} subsector={subsector} lng={lng} />
                </TabPanel>
            </TabView>
        </div>
    }

    return (
        <div id="stat_cate" className="nso_cate_body pl-0">
            {/* Title */}
            <span className="__cate_title">{name ? name[0]?.text : <LoadingDiv />}</span>

            {/* PrimeReact Tabs */}
            <TabView
                className='nso_tab'
                activeIndex={activeIndex}
                onTabChange={(e) => {
                    const newTab = getIndexTab(e.index);
                    router.push(`/statcate/${newTab}/${sector}/${subsector}`);
                }}
            >

                {/* ✅ Хүснэгт Tab */}
                <TabPanel header={lng === "mn" ? "Хүснэгт" : "Table"}>
                    <TablesData sector={sector} subsector={subsector} lng={lng} />
                </TabPanel>

                {/* ✅ Танилцуулга */}
                <TabPanel header={lng === "mn" ? "Танилцуулга" : "Introduction"}>
                    <MainIndicator sector={decodeURIComponent(sector)} subsector={decodeURIComponent(subsector)} lng={lng} />
                </TabPanel>

                {/* ✅ Тайлан */}
                <TabPanel header={lng === "mn" ? "Тайлан" : "Report"}>
                    <Report sector={decodeURIComponent(sector)} subsector={subsector} lng={lng} />
                </TabPanel>

                {/* ✅ Аргачлал */}
                <TabPanel header={lng === "mn" ? "Аргачлал" : "Methodology"}>
                    <Methodology sector={decodeURIComponent(sector)} subsector={subsector} lng={lng} />
                </TabPanel>

                {/* ✅ Чанарын тайлан */}
                <TabPanel header={lng === "mn" ? "Чанарын тайлан" : "Quality Report"}>
                    <Qualityreport sector={decodeURIComponent(sector)} subsector={subsector} lng={lng} />
                </TabPanel>

            </TabView>
        </div>
    );
}
