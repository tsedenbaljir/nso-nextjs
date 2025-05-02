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
      if (tkt) {
        setDashboard(
          `https://tableau.1212.mn/trusted/${tkt}/views/PopulationMongolia2022/Dashboard1?:iid=1`
        );
        setLoadingDash(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="nso_container">
      {loadingDash ? (
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
          <div className="__stat_detail_tableau">
            <iframe src={dashboard} width="100%" height="1000px"></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
