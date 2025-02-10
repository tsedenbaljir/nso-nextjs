"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TablesData from "./table/tables";
import MainIndicator from "./indicator/main";
import Report from "./reports/main";
import { TabView, TabPanel } from "primereact/tabview";

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
        fetchSubcategories(sector);

    }, [sector, subsector]);

    return (
        <div id="stat_cate" className="nso_cate_body">
            {/* Title */}
            <span className="__cate_title">{name && name[0]?.text}</span>

            {/* PrimeReact Tabs */}
            <TabView
                activeIndex={activeIndex}
                onTabChange={(e) => {
                    const newTab = getIndexTab(e.index);
                    router.push(`/statcate/${newTab}/${sector}/${subsector}`); // ✅ Navigate to new tab
                }}
            >
                {/* Хүснэгт Tab */}
                <TabPanel header="Хүснэгт">
                    <TablesData sector={sector} subsector={subsector} lng={lng} />
                </TabPanel>

                {/* Other Tabs */}
                <TabPanel header="Танилцуулга">
                    <MainIndicator sector={sector} subsector={subsector} lng={lng}  />
                </TabPanel>

                <TabPanel header="Тайлан">
                    <Report sector={sector} subsector={subsector} lng={lng} />
                </TabPanel>

                <TabPanel header="Аргачлал">
                    <Report sector={sector} subsector={subsector} lng={lng} />
                </TabPanel>

                <TabPanel header="Чанарын тайлан">
                    <p className="p-4">Энэ бол Чанарын тайлангийн хэсэг.</p>
                </TabPanel>
            </TabView>
        </div>
    );
}
