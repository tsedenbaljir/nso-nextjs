"use client";

import { useEffect, useRef, useState } from "react";
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
            script.onerror = () => {
                tableauScriptPromise = null;
                reject(new Error("Tableau Embedding API ачаалахад алдаа гарлаа"));
            };
            document.head.appendChild(script);
        });
    }

    return tableauScriptPromise;
}

/**
 * @param {object} props
 * @param {string} props.viewPath
 * @param {number} [props.height]
 * @param {string} [props.className]
 * @param {string} [props.token] - Shared JWT (parent-аас өгвөл дахин татахгүй)
 * @param {string} [props.serverUrl]
 */
export default function TableauVizEmbed({
    viewPath,
    height = 850,
    className = "",
    token: tokenProp,
    serverUrl: serverUrlProp,
}) {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!viewPath) {
            setLoading(false);
            return undefined;
        }

        let cancelled = false;
        const container = containerRef.current;

        async function embed() {
            setLoading(true);
            setError(null);

            try {
                let token = tokenProp;
                let serverUrl = serverUrlProp || "https://tableau.1212.mn";

                if (!token) {
                    const res = await fetch("/api/tableau-token", { cache: "no-store" });
                    const data = await res.json();
                    if (!res.ok || !data?.token) {
                        throw new Error(data?.error || "Tableau token авахад алдаа гарлаа");
                    }
                    token = data.token;
                    serverUrl = data.serverUrl || serverUrl;
                }

                await loadTableauEmbeddingApi(serverUrl);

                if (cancelled || !containerRef.current) return;

                containerRef.current.innerHTML = "";

                const viz = document.createElement("tableau-viz");
                viz.setAttribute("src", toTableauViewUrl(viewPath));
                viz.setAttribute("token", token);
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

                viz.addEventListener("vizloaderror", handleVizError);
                viz.addEventListener("vizerror", handleVizError);
                viz.addEventListener("authenticationfailed", handleVizError);
                viz.addEventListener("authentication_error", handleVizError);
                viz.addEventListener("firstinteractive", () => {
                    if (!cancelled) setLoading(false);
                });

                containerRef.current.appendChild(viz);
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Tableau дашбоард ачаалахад алдаа гарлаа");
                    setLoading(false);
                }
            }
        }

        embed();

        return () => {
            cancelled = true;
            if (container) {
                container.innerHTML = "";
            }
        };
    }, [viewPath, height, tokenProp, serverUrlProp]);

    if (!viewPath) return null;

    return (
        <div className={className}>
            {loading && !error && (
                <p className="py-4 text-center text-sm text-gray-500">
                    Мэдээллийг ачаалж байна...
                </p>
            )}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}
            <div
                ref={containerRef}
                className="w-full"
                style={{ minHeight: error ? 0 : height }}
            />
        </div>
    );
}
