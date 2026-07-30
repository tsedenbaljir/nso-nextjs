"use client";

import { useEffect, useState } from "react";
import TableauVizEmbed from "./TableauVizEmbed";
import { getTableauServerUrl } from "@/lib/tableau/viewUrl";

/**
 * Tableau view-г нэвтрэлтгүйгээр (public) сайт дотор iframe-ээр харуулна.
 * 1. /api/tableau-key → trusted ticket → /trusted/{ticket}{viewPath} iframe
 * 2. Ticket авч чадаагүй бол /api/tableau-token (Connected App JWT) embed-руу шилжинэ.
 */
export default function TableauPublicEmbed({ viewPath, height = 900, className = "" }) {
    const [iframeUrl, setIframeUrl] = useState(null);
    const [useTokenFallback, setUseTokenFallback] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!viewPath) {
            setLoading(false);
            return undefined;
        }

        let cancelled = false;

        async function loadTrustedTicket() {
            setLoading(true);
            setIframeUrl(null);
            setUseTokenFallback(false);

            let ticket = null;
            try {
                const res = await fetch("/api/tableau-key?key=ViewerUser", {
                    cache: "no-store",
                });
                if (res.ok) {
                    const result = await res.json();
                    ticket = result?.value;
                }
            } catch {
                ticket = null;
            }

            if (cancelled) return;

            // Tableau ticket олгохгүй бол "-1" буцаадаг → Connected App token embed-руу шилжинэ
            if (!ticket || ticket === "-1") {
                console.warn(
                    "Tableau trusted ticket олдсонгүй — token embed-руу шилжиж байна"
                );
                setUseTokenFallback(true);
                setLoading(false);
                return;
            }

            const params = ":embed=y&:showVizHome=no&:toolbar=no&:tabs=no";
            setIframeUrl(
                `${getTableauServerUrl()}/trusted/${ticket}${viewPath}?${params}`
            );
            setLoading(false);
        }

        loadTrustedTicket();

        return () => {
            cancelled = true;
        };
    }, [viewPath]);

    if (!viewPath) return null;

    if (useTokenFallback) {
        return <TableauVizEmbed viewPath={viewPath} height={height} className={className} />;
    }

    return (
        <div className={className}>
            {loading && (
                <p className="py-4 text-center text-sm text-gray-500">
                    Мэдээллийг ачаалж байна...
                </p>
            )}
            {iframeUrl && (
                <iframe
                    src={iframeUrl}
                    title="Dashboard"
                    width="100%"
                    height={height}
                    style={{ border: "none", display: "block" }}
                    allowFullScreen
                />
            )}
        </div>
    );
}
