"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import TablesData from "./table/tables";
import MainIndicator from "./indicator/main";
import Report from "./reports/main";
import Methodology from "./methodology/main";
import Qualityreport from "./qualityreport/main";
import { TabView, TabPanel } from "primereact/tabview";
import LoadingDiv from '@/components/Loading/OneField/Index';
import { Skeleton } from 'antd';

export default function Tabs({ lng, tabs, sector, subsector }) {
    const router = useRouter();

    // Set initial active tab
    const [name, setName] = useState(null);
    
    // Track which tabs have data
    const [hasIndicatorData, setHasIndicatorData] = useState(false);
    const [hasReportData, setHasReportData] = useState(false);
    const [hasMethodologyData, setHasMethodologyData] = useState(false);
    const [hasQualityReportData, setHasQualityReportData] = useState(false);
    const [isCheckingData, setIsCheckingData] = useState(true);

    // Build available tabs based on data
    const availableTabs = useMemo(() => {
        const tabs = [{ name: "table", index: 0 }];
        
        if (hasIndicatorData) {
            tabs.push({ name: "indicator", index: 1 });
        }
        if (hasReportData) {
            tabs.push({ name: "report", index: 2 });
        }
        if (hasMethodologyData) {
            tabs.push({ name: "methodology", index: 3 });
        }
        if (hasQualityReportData) {
            tabs.push({ name: "qualityreport", index: 4 });
        }
        return tabs;
    }, [hasIndicatorData, hasReportData, hasMethodologyData, hasQualityReportData]);

    // Get tab index based on tab name
    const getTabIndex = (tabName) => {
        const tab = availableTabs.find(t => t.name === tabName);
        return tab ? tab.index : 0;
    };

    // Get tab name from index
    const getIndexTab = (index) => {
        const tab = availableTabs.find(t => t.index === index);
        return tab ? tab.name : "table";
    };

    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        setActiveIndex(getTabIndex(tabs));
    }, [tabs, availableTabs]);

    useEffect(() => {
        const checkDataAvailability = async () => {
            setIsCheckingData(true);
            
            try {
                // Check Indicator data
                const indicatorResponse = await fetch(`/api/catalogue?list_id=${subsector}`);
                const indicatorResult = await indicatorResponse.json();
                setHasIndicatorData(!!(indicatorResult?.data?.info || indicatorResult?.data?.info_eng || indicatorResult?.data?.tableau));

                // Check Report data
                const reportResponse = await fetch(`/api/download?info=${subsector}&lng=${lng}&type=report`);
                const reportResult = await reportResponse.json();
                setHasReportData(Array.isArray(reportResult?.data) && reportResult.data.length > 0);

                // Check Methodology data
                const methodologyResponse = await fetch(`/api/methodology/list?catalogue_id=${subsector}&lng=${lng}`);
                const methodologyResult = await methodologyResponse.json();
                setHasMethodologyData(Array.isArray(methodologyResult?.data) && methodologyResult.data.length > 0);

                // Check Quality Report data
                const qualityReportResponse = await fetch(`/api/download?info=${subsector}&lng=${lng}&type=reportSector`);
                const qualityReportResult = await qualityReportResponse.json();
                setHasQualityReportData(Array.isArray(qualityReportResult?.data) && qualityReportResult.data.length > 0);

            } catch (error) {
                console.error("Error checking data availability:", error);
            } finally {
                setIsCheckingData(false);
            }
        };

        // Fetch subcategories
        const fetchSubcategories = async (categoryId) => {
            try {
                const response = await fetch(`${process.env.BACKEND_URL}/api/subsectorname?subsectorname=${categoryId}&lng=${lng}`);
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
        checkDataAvailability();

    }, [sector, subsector, lng]);

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
            <span className="__cate_title">{name ? name[0]?.text.split('_')[1] ? name[0]?.text.split('_')[1] : name[0]?.text : <LoadingDiv />}</span>

            {/* PrimeReact Tabs */}
            <TabView
                className='nso_tab'
                activeIndex={activeIndex}
                onTabChange={(e) => {
                    const newTab = getIndexTab(e.index);
                    router.push(`/${lng}/statcate/${newTab}/${sector}/${subsector}`);
                }}
            >

                {/* ✅ Хүснэгт Tab - Always visible */}
                <TabPanel header={lng === "mn" ? "Хүснэгт" : "Table"}>
                    <TablesData sector={decodeURIComponent(sector)} subsector={subsector} lng={lng} />
                </TabPanel>

                {/* ✅ Танилцуулга - Show only if has data */}
                {!isCheckingData ? hasIndicatorData && (
                    <TabPanel header={lng === "mn" ? "Танилцуулга" : "Introduction"}>
                        <MainIndicator sector={decodeURIComponent(sector)} subsector={subsector} lng={lng} />
                    </TabPanel>
                ): <TabPanel header={<Skeleton.Input size={"small"} />}></TabPanel>}

                {/* ✅ Тайлан - Show only if has data */}
                {!isCheckingData ? hasReportData && (
                    <TabPanel header={lng === "mn" ? "Тайлан" : "Report"}>
                        <Report sector={decodeURIComponent(sector)} subsector={subsector} lng={lng} />
                    </TabPanel>
                ): <TabPanel header={<Skeleton.Input size={"small"} />}></TabPanel>}

                {/* ✅ Аргачлал - Show only if has data */}
                {!isCheckingData ? hasMethodologyData && (
                    <TabPanel header={lng === "mn" ? "Аргачлал" : "Methodology"}>
                        <Methodology sector={decodeURIComponent(sector)} subsector={subsector} lng={lng} />
                    </TabPanel>
                ): <TabPanel header={<Skeleton.Input size={"small"} />}></TabPanel>}

                {/* ✅ Чанарын тайлан - Show only if has data */}
                {!isCheckingData ? hasQualityReportData && (
                    <TabPanel header={lng === "mn" ? "Чанарын тайлан" : "Quality Report"}>
                        <Qualityreport sector={decodeURIComponent(sector)} subsector={subsector} lng={lng} />
                    </TabPanel>
                ): <TabPanel header={<Skeleton.Input size={"small"} />}></TabPanel>}

            </TabView>
        </div>
    );
}
