"use client";
import React, { useEffect, useState } from "react";
import LoadingDiv from "@/components/Loading/Text/Index";
import "@/components/styles/statistic.scss";

export default function Statcate({ params }) {
  const [data, setData] = useState([]);
  const [dashboard, setDashboard] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDash, setLoadingDash] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/data-visualisation/dashboard?data_viz_id=${params.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSelectItem = async (dash) => {
    setLoadingDash(true);
    const params = new URLSearchParams();
    params.append("key", "value");
    // Fetch Tableau Key
    const tableauResponse = await fetch(
      `https://gateway.1212.mn/services/dynamic/api/public/tableau-report?${params.toString()}`,
      { cache: "no-store" }
    );
    if (!tableauResponse.ok) throw new Error("Failed to fetch Tableau key");

    const tableauResult = await tableauResponse.json();
    const tkt = tableauResult?.value;
    // Ensure `data.tableau` exists before setting `iframeSrc`
    if (tkt && dash) {
      setDashboard(`https://tableau.1212.mn/trusted/${tkt}${dash}`);
      setLoadingDash(false);
    }
  };

  return (
    <div className="nso_container">
      {loading ? (
        <div className="">
          <LoadingDiv />
          <br />
          <LoadingDiv />
          <br />
          <LoadingDiv />
          <br />
        </div>
      ) : error ? (
        <p className="text-red-500">Алдаа гарсан байна. Та түр хүлээнэ үү.</p>
      ) : (
        <div className="w-full">
          {data.length === 0 && (
            <p className="text-red-500">Одоогоор мэдээлэл байхгүй байна.</p>
          )}
          <div className="__data_vis_cards w-full">
            {data.length > 0 &&
              data.map((dt, index) => {
                return (
                  <div
                    index={index}
                    onClick={() => {
                      onSelectItem(dt.tableau);
                    }}
                    className="_card"
                  >
                    <img className="cover" src={"/images/news1.png"} />
                    <span className="title">{dt.name}</span>
                  </div>
                );
              })}
          </div>
          {loadingDash && <p className="text-red-500">Уншиж байна...</p>}
          {!loadingDash && dashboard && (
            <div className="__stat_detail_tableau">
              <iframe src={dashboard} width="100%" height="1000px"></iframe>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
