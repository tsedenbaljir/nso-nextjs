"use client";

import { useEffect, useRef, useState } from "react";
import { fetchTableauEmbedToken } from "@/app/services/actions";
import { parseTableauEmbedError } from "@/lib/tableau/errors";
import { toTableauViewUrl } from "@/lib/tableau/viewUrl";

let tableauScriptPromise = null;

function loadTableauEmbeddingApi(serverUrl) {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("Tableau embed requires a browser"));
    }

    if (window.customElements?.get("tableau-viz")) {
        return Promise.resolve();
    }

    if (!tableauScriptPromise) {
        tableauScriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.type = "module";
            script.src = `${serverUrl}/javascripts/api/tableau.embedding.3.latest.min.js`;
            script.onload = () => resolve();
            script.onerror = () =>
                reject(new Error("Tableau Embedding API ачаалахад алдаа гарлаа"));
            document.head.appendChild(script);
        });
    }

    return tableauScriptPromise;
}

export default function TableauVizEmbed({ viewPath, height = 850, className = "" }) {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!viewPath) {
            setLoading(false);
            return undefined;
        }

        let cancelled = false;

        async function embed() {
            setLoading(true);
            setError(null);

            try {
                const result = await fetchTableauEmbedToken();
                if (!result?.success || !result?.data?.token) {
                    throw new Error(result?.error || "Tableau token авахад алдаа гарлаа");
                }

                const payload = result.data;
                const serverUrl = payload.serverUrl || "https://tableau.1212.mn";
                await loadTableauEmbeddingApi(serverUrl);

                if (cancelled || !containerRef.current) return;

                containerRef.current.innerHTML = "";

                const viz = document.createElement("tableau-viz");
                viz.setAttribute("src", toTableauViewUrl(viewPath));
                viz.setAttribute("token", payload.token);
                viz.setAttribute("toolbar", "hidden");
                viz.setAttribute("hide-tabs", "true");
                viz.style.width = "100%";
                viz.style.height = `${height}px`;

                const handleVizError = (event) => {
                    const parsed = parseTableauEmbedError(event?.detail || {});
                    if (!cancelled) {
                        setError(parsed.message);
                        setLoading(false);
                    }
                };

                viz.addEventListener("vizerror", handleVizError);
                viz.addEventListener("authentication_error", handleVizError);

                containerRef.current.appendChild(viz);
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Tableau дашбоард ачаалахад алдаа гарлаа");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        embed();

        return () => {
            cancelled = true;
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, [viewPath, height]);

    if (!viewPath) return null;

    return (
        <div className={className}>
            {loading && !error && (
                <p className="py-4 text-center text-sm text-gray-500">Tableau ачаалж байна...</p>
            )}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}
            <div ref={containerRef} className="w-full" style={{ minHeight: error ? 0 : height }} />
        </div>
    );
}
