"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import LoadingDiv from "@/components/Loading/Text/Index";
import TableauEmbed from "@/components/tableau/TableauEmbed";

export default function Main({ lng, sector, subsector }) {
  const [data, setData] = useState(null);
  const [tableauPath, setTableauPath] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/catalogue?list_id=${subsector}`, {
          cache: "no-store",
        });
        if (!response?.ok) throw new Error("Failed to fetch catalogue data");

        const result = await response?.json();

        if (result.data) {
          setData(result.data);
          const path =
            lng === "mn"
              ? result.data.tableau
              : result.data.tableau_eng || result.data.tableau;
          setTableauPath(path || "");
        } else {
          console.error("No data found in catalogue response");
        }
      } catch (err) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subsector, lng]);

  return (
    <div className="bg-white">
      {loading ? (
        <div className="text-center py-4">
          <LoadingDiv />
          <br />
          <LoadingDiv />
          <br />
          <LoadingDiv />
        </div>
      ) : error ? (
        <p className="p-4 text-red-500">{error}</p>
      ) : (
        <>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            className="text-black"
          >
            {lng === "mn" ? data?.info : data?.info_eng || "No content available"}
          </ReactMarkdown>

          <br />

          <TableauEmbed viewPath={tableauPath} height={850} />
        </>
      )}
    </div>
  );
}
