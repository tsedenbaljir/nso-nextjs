"use client";

import TableauVizEmbed from "./TableauVizEmbed";

export default function TableauEmbed({ viewPath, height = 850, className = "" }) {
    if (!viewPath) return null;
    return <TableauVizEmbed viewPath={viewPath} height={height} className={className} />;
}
