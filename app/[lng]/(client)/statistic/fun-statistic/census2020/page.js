"use client";
import React, { useEffect, useState } from "react";
import LoadingDiv from "@/components/Loading/Text/Index";
import "@/components/styles/statistic.scss";
import { fetchTableauTicket } from "@/app/services/fun-statistic";

export default function Statcate() {
  const [dashboard, setDashboard] = useState("");
  const [loadingDash, setLoadingDash] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingDash(true);
      try {
        const tableauResult = await fetchTableauTicket({ key: "value" });
        const tkt = tableauResult?.value;

        if (!tkt) {
          throw new Error("Tableau оноосон түлхүүр олдсонгүй.");
        }

        setDashboard(
          `https://tableau.1212.mn/trusted/${tkt}/views/PopulationMongolia2022/Dashboard1?:iid=1`
        );
        setError(null);
      } catch (err) {
        console.error("Census 2020 tableau error:", err);
        setError(err.message || "Алдаа гарлаа. Түр хүлээгээд дахин оролдоно уу.");
      } finally {
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
