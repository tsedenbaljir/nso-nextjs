"use client";
import { useState } from "react";
import { subsectorDataMap } from "./subsectorDataMap";
import SubsectorPage from "./SubsectorPage";

export default function Layout({ params: { lng } }) {
  const [selectedId, setSelectedId] = useState("Subsector1");

  // Салбаруудыг ангилж өгнө
  const sectorStructure = {
    "СТАТИСТИК ТООН МЭДЭЭЛЭЛ": ["Subsector1"],
    "ХҮСНЭГТ": ["Subsector2"],
    "ДЭД САЛБАР": ["Subsector3"],
    "ҮНДСЭН САЛБАР": ["Subsector4"]
  };

  return (
    <div className="nso_page_wrap">
      <div className="nso_container">
        <div className="nso_page_content_wrap">
          <div className="__page_block">
            <div className="wrap_width">
              <div className="__opendata_wrap __dfs">
                {/* Sidebar */}
                <div className="__opendata_sidebar">
                  <div className="__od_side">
                    <ul className="__opendata_tree">
                      {Object.entries(sectorStructure).map(([sectorName, subsectorIds]) => (
                        <li key={sectorName} className="__opendata_tree_first">
                          <span className="__first_name">{sectorName}</span>
                          <ul>
                            {subsectorIds.map((subId) => (
                              <li
                                key={subId}
                                className={`__sub_li ${selectedId === subId ? "is_arrow" : ""}`}
                                onClick={() => setSelectedId(subId)}
                              >
                                <h3 className="__opendata_sub_name">
                                  {subsectorDataMap[subId].title}
                                </h3>
                                {/* Дэд салбарын агуулга нээгдсэн үед */}
                                {selectedId === subId && (
                                  <ul className="__inner_ul">
                                    <li><a href="#output">{lng === 'mn' ? 'Гаралтын утга' : 'Output'}</a></li>
                                    <li><a href="#outputExample">{lng === 'mn' ? 'Гаралтын жишээ' : 'Output Example'}</a></li>
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Main content */}
                <div className="__opendata_main __opendata_customize">
                  <SubsectorPage data={subsectorDataMap[selectedId]} lng={lng} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
