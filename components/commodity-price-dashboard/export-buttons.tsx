"use client";

import { useState, type RefObject } from "react";
import { toJpeg, toPng } from "html-to-image";

type Format = "png" | "jpeg";

function fileName(name: string, format: Format) {
  return `${name}.${format === "jpeg" ? "jpg" : "png"}`;
}

async function capture(node: HTMLElement, format: Format) {
  const bg =
    getComputedStyle(node.closest(".nso-price-dash") ?? document.documentElement)
      .getPropertyValue("--card")
      .trim() || "#ffffff";
  const width = Math.max(node.scrollWidth, node.offsetWidth);
  const height = Math.max(node.scrollHeight, node.offsetHeight);
  const options = {
    backgroundColor: bg,
    cacheBust: true,
    pixelRatio: 2,
    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      overflow: "visible",
    },
  };
  return format === "png" ? toPng(node, options) : toJpeg(node, { ...options, quality: 0.92 });
}

export function ExportButtons({
  targetRef,
  name,
}: {
  targetRef: RefObject<HTMLElement | null>;
  name: string;
}) {
  const [busy, setBusy] = useState<Format | null>(null);

  async function save(format: Format) {
    const node = targetRef.current;
    if (!node || busy) return;
    setBusy(format);
    try {
      const url = await capture(node, format);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName(name, format);
      link.click();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="export-btns">
      <button type="button" className="export-btn" disabled={Boolean(busy)} onClick={() => save("png")}>
        {busy === "png" ? "..." : "PNG"}
      </button>
      <button type="button" className="export-btn" disabled={Boolean(busy)} onClick={() => save("jpeg")}>
        {busy === "jpeg" ? "..." : "JPEG"}
      </button>
    </div>
  );
}
