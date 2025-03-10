"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Path from '@/components/path/Index';
import OpendataTable from '@/components/opendata/OpendataTable';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function OpenData({ params: { lng } }) {
    const { t } = useTranslation(lng, "lng", "");
    const [activeId, setActiveId] = useState(null);
    const [sectors, setSectors] = useState([]);
    const [selectedSector, setSelectedSector] = useState(null);
    const [subsectors, setSubsectors] = useState([]);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedData, setSelectedData] = useState(null);
    const [isJson, setIsJson] = useState(true);

    const breadMap = [
        { label: t('home'), url: [lng === 'mn' ? '/mn' : '/en'] },
        { label: t('dataBase'), url: [(lng === 'mn' ? '/mn' : '/en') + '/data-base'] },
        { label: t('opendata.name') }
    ];

    // Example data structure
    const exampleSectors = [
        { id: "1", text: "Статистик тоон мэдээлэл", text_en: "Статистик тоон мэдээлэл" },
        { id: "2", text: "Хүснэгт болон ангилал", text_en: "Хүснэгт болон ангилал, health" },
        { id: "3", text: "Багц статистик тоон мэдээлэл", text_en: "Багц статистик тоон мэдээлэл" },
        { id: "4", text: "Салбар болон дэд салбар", text_en: "Салбар болон дэд салбар" }
    ];

    const exampleSubsectors = {
        "1": [
            { id: "pop6", name: "Хүн амын тоо", name_en: "Population count" },
            { id: "pop7", name: "Хүн амын өсөлт", name_en: "Population growth" }
        ],
        "2": [
            { id: "Edu_main", name: "Боловсролын үндсэн үзүүлэлт", name_en: "Main education indicators" }
        ]
    };

    const exampleTables = {
        "pop6": [
            {
                id: "DT_NSO_0100_001V1",
                name: "Хүн амын тоо, хүйсээр",
                name_en: "Population by gender",
                variables: [
                    { code: "Хүйс", text: "Хүйс", values: ["0", "1", "2"] },
                    { code: "ОН", text: "Он", values: ["2020", "2021", "2022"] }
                ]
            }
        ]
    };

    // Example table data
    const exampleTableData = {
        urlInput: [
            { Parameter: "key", Type: "string", Required: "Yes", Description: "API key" },
            { Parameter: "format", Type: "string", Required: "No", Description: "Response format (json/xml)" }
        ],
        input: [
            { Field: "code", Type: "string", Description: "Statistical code" },
            { Field: "year", Type: "number", Description: "Year of data" }
        ],
        output: [
            { Field: "status", Type: "boolean", Description: "Response status" },
            { Field: "data", Type: "array", Description: "Statistical data" }
        ]
    };

    useEffect(() => {
        // Simulate API fetch
        setSectors(exampleSectors);
        setLoading(false);
    }, []);

    const handleSectorClick = (sectorId) => {
        setSelectedSector(sectorId);
        setSubsectors(exampleSubsectors[sectorId] || []);
    };

    const handleSubsectorClick = (subsectorId) => {
        setTables(exampleTables[subsectorId] || []);
    };

    const handleTableClick = (tableId) => {
        setSelectedData({
            name: "Statistical API Endpoint",
            apiType: "POST",
            api: "http://45.117.34.241/api/v1/mn/NSO/Pop/pop6/DT_NSO_0100_001V1.px",
            urlInput: exampleTableData.urlInput,
            input: exampleTableData.input,
            output: exampleTableData.output,
            inputEg: JSON.stringify({
                query: [
                    {
                        code: "Хүйс",
                        selection: { filter: "item", values: ["1"] }
                    }
                ],
                response: { format: "json" }
            }, null, 2),
            outputEgJson: JSON.stringify({
                status: true,
                data: [{ year: 2022, value: 12345 }]
            }, null, 2),
            outputEgXml: `<?xml version="1.0"?>
                            <response>
                                <status>true</status>
                                <data>
                                    <item>
                                        <year>2022</year>
                                        <value>12345</value>
                                    </item>
                                </data>
                            </response>`
        });
    };

    return (
        <div className="nso_page_wrap">
            <Path name={t('dataBase')} breadMap={breadMap} />
            <div className="nso_container">
                <div className="nso_page_content_wrap">
                    <div className="__page_block">
                        <div className="wrap_width">
                            <div className="__opendata_wrap __dfs">
                                <div className="__opendata_sidebar">
                                    <div className="__od_side">
                                        <ul className="__opendata_tree">
                                            {sectors.map((sector) => (
                                                <li key={sector.id} className="__opendata_tree_first">
                                                    <span
                                                        className="__first_name"
                                                        onClick={() => handleSectorClick(sector.id)}
                                                    >
                                                        {lng === "mn" ? sector.text : sector.text_en}
                                                    </span>
                                                    {selectedSector === sector.id && (
                                                        <ul>
                                                            {subsectors.map((subsector) => (
                                                                <li
                                                                    key={subsector.id}
                                                                    className={`__sub_li ${activeId === subsector.id ? 'is_arrow' : ''}`}
                                                                    onClick={() => {
                                                                        setActiveId(subsector.id);
                                                                        handleSubsectorClick(subsector.id);
                                                                    }}
                                                                >
                                                                    <h3 className="__opendata_sub_name">
                                                                        {lng === "mn" ? subsector.name : subsector.name_en}
                                                                    </h3>
                                                                    {activeId === subsector.id && tables.map((table) => (
                                                                        <div key={table.id} className="__inner_ul">
                                                                            <h4>{lng === "mn" ? table.name : table.name_en}</h4>
                                                                            <div className="table-variables">
                                                                                {table.variables.map((variable) => (
                                                                                    <div key={variable.code}>
                                                                                        <strong>{variable.text}:</strong>
                                                                                        {variable.values.join(", ")}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="__opendata_main __opendata_customize">
                                    {selectedData ? (
                                        <div className="__opendata_header">
                                            <h1>{t('opendata.head')}</h1>
                                            <p>{t('opendata.info')}</p>

                                            <div className="__opendata_main_block">
                                                <div className="__open_section">
                                                    <h1 id="title">
                                                        {selectedData.name} <span className="__shiffer">#</span>
                                                    </h1>
                                                    <h5 className="__request_name __post">{selectedData.apiType}</h5>
                                                    <pre><code>{selectedData.api}</code></pre>

                                                    {selectedData.urlInput?.length > 0 && (
                                                        <div style={{ overflow: 'auto' }}>
                                                            <OpendataTable data={selectedData.urlInput} />
                                                        </div>
                                                    )}

                                                    {selectedData.input?.length > 0 && (
                                                        <div className="__opendata_item">
                                                            <h2 id="input">
                                                                {t('opendata.input')} <span className="__shiffer">#</span>
                                                            </h2>
                                                            <div style={{ overflow: 'auto' }}>
                                                                <OpendataTable data={selectedData.input} />
                                                            </div>
                                                            <h2 id="inputEg" className="__margin-top">
                                                                {t('opendata.inputEg')} <span className="__shiffer">#</span>
                                                            </h2>
                                                            {/* <SyntaxHighlighter language="json" style={tomorrow}>
                                                                {selectedData.inputEg}
                                                            </SyntaxHighlighter> */}
                                                        </div>
                                                    )}

                                                    {selectedData.output?.length > 0 && (
                                                        <div className="__opendata_item">
                                                            <h2 id="output">
                                                                {t('opendata.output')} <span className="__shiffer">#</span>
                                                            </h2>
                                                            <div style={{ overflow: 'auto' }}>
                                                                <OpendataTable data={selectedData.output} />
                                                            </div>
                                                            <h2 id="outputEg" className="__margin-top">
                                                                {t('opendata.outputEg')} <span className="__shiffer">#</span>
                                                            </h2>
                                                            <ul className="__opendata_tab">
                                                                <li
                                                                    className={isJson ? 'active' : ''}
                                                                    onClick={() => setIsJson(true)}
                                                                >
                                                                    {t('opendata.json')}
                                                                </li>
                                                                <li
                                                                    className={!isJson ? 'active' : ''}
                                                                    onClick={() => setIsJson(false)}
                                                                >
                                                                    {t('opendata.xml')}
                                                                </li>
                                                            </ul>
                                                            {/* {isJson ? (
                                                                <SyntaxHighlighter language="json" style={tomorrow}>
                                                                    {selectedData.outputEgJson}
                                                                </SyntaxHighlighter>
                                                            ) : (
                                                                <SyntaxHighlighter language="xml" style={tomorrow}>
                                                                    {selectedData.outputEgXml}
                                                                </SyntaxHighlighter>
                                                            )} */}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="__opendata_header">
                                            <h1>{t('opendata.head')}</h1>
                                            <p>{t('opendata.info')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 