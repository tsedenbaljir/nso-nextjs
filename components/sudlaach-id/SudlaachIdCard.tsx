"use client";

import { useEffect, useRef, useState } from "react";
import { QRCode } from "antd";
import { toJpeg, toPng } from "html-to-image";
import "./sudlaach-id.scss";

function displayName(value: string) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleUpperCase("mn");
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function slugName(...parts: string[]) {
  return (
    parts
      .map((part) => part.trim())
      .filter(Boolean)
      .join("-")
      .replace(/\s+/g, "-") || "unemleh"
  );
}

async function waitForImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    }),
  );
}

async function captureCard(node: HTMLElement, format: "png" | "jpeg") {
  await waitForImages(node);
  const width = Math.max(node.scrollWidth, node.offsetWidth);
  const height = Math.max(node.scrollHeight, node.offsetHeight);
  const options = {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#f7f8f9",
    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
    },
  };
  return format === "png"
    ? toPng(node, options)
    : toJpeg(node, { ...options, quality: 0.95 });
}

function downloadDataUrl(url: string, fileName: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
}

type EmpCard = {
  givenName?: string;
  surName?: string;
  familyName?: string;
  positionName?: string;
  insertedDate?: string | Date | null;
};

type Props = {
  first: string;
  last: string;
  empId: string;
  aimagCode: string;
  position: string;
  positionName?: string;
  qrUrl: string;
  initialEmp?: EmpCard | null;
};

export function SudlaachIdCard({
  first,
  last,
  empId,
  position,
  positionName = "",
  qrUrl,
  initialEmp = null,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null);
  const [photoOk, setPhotoOk] = useState(true);
  const [emp, setEmp] = useState<EmpCard | null>(initialEmp);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/sudlaach/${encodeURIComponent(empId)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.status && json.data) {
          setEmp((prev) => ({
            ...json.data,
            positionName: String(json.data.positionName || prev?.positionName || "").trim(),
          }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [empId]);

  const ovog = displayName(emp?.surName || emp?.familyName || last);
  const ner = displayName(emp?.givenName || first);
  const jobSource = String(emp?.positionName || positionName || "").trim();
  const job = jobSource || displayName(position);
  const issued = formatDate(emp?.insertedDate);
  const photoSrc = `/api/sudlaach/${encodeURIComponent(empId)}/photo?v=2`;
  const fileBase = slugName(ovog, ner, empId);

  async function savePng() {
    const node = cardRef.current;
    if (!node || busy) return;
    setBusy("png");
    try {
      const url = await captureCard(node, "png");
      downloadDataUrl(url, `${fileBase}.png`);
    } finally {
      setBusy(null);
    }
  }

  async function savePdf() {
    const node = cardRef.current;
    if (!node || busy) return;
    setBusy("pdf");
    try {
      const url = await captureCard(node, "jpeg");
      const { jsPDF } = await import("jspdf");
      const width = Math.max(node.scrollWidth, node.offsetWidth);
      const height = Math.max(node.scrollHeight, node.offsetHeight);
      const pdf = new jsPDF({
        orientation: height >= width ? "portrait" : "landscape",
        unit: "px",
        format: [width, height],
        hotfixes: ["px_scaling"],
      });
      pdf.addImage(url, "JPEG", 0, 0, width, height);
      pdf.save(`${fileBase}.pdf`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="sid-page">
      <article className="sid-card">
        <div className="sid-frame" ref={cardRef}>
          <header className="sid-head">
            <img src="/logo.png" alt="Үндэсний статистикийн хороо" className="sid-logo" />
          </header>

          <div className="sid-idrow">
            <div className="sid-photo">
              {photoOk ? (
                <img
                  src={photoSrc}
                  alt="Судлаачийн зураг"
                  onError={() => setPhotoOk(false)}
                />
              ) : (
                <span className="sid-photo-fallback" aria-hidden />
              )}
            </div>
            <div className="sid-qrcol">
              <QRCode
                value={qrUrl}
                size={112}
                type="svg"
                bordered={false}
                errorLevel="L"
                bgColor="#ffffff"
                color="#111111"
              />
              <p className="sid-no">
                <span>№</span>
                <span className="sid-dots">{empId}</span>
              </p>
            </div>
          </div>

          <dl className="sid-fields">
            <div className="sid-field">
              <dt>Овог</dt>
              <dd>{ovog}</dd>
            </div>
            <div className="sid-field">
              <dt>Нэр</dt>
              <dd>{ner}</dd>
            </div>
            <div className="sid-field sid-field--pos">
              <dt>Албан тушаал</dt>
              <dd>{job}</dd>
            </div>
          </dl>

          <footer className="sid-foot">
            <div className="sid-sign">
              <p className="sid-sign-title">НИЙГМИЙН СТАТИСТИКИЙН ГАЗРЫН ДАРГА</p>
              <p className="sid-sign-name">Ш.Ариунболд</p>
            </div>
            <p className="sid-date">
              <span>Олгосон огноо</span>
              <span className="sid-dots">{issued}</span>
            </p>
          </footer>
        </div>

        <div className="sid-export">
          <button
            type="button"
            className="sid-export-btn"
            disabled={Boolean(busy)}
            onClick={savePng}
          >
            {busy === "png" ? "Татаж байна…" : "PNG татах"}
          </button>
          <button
            type="button"
            className="sid-export-btn"
            disabled={Boolean(busy)}
            onClick={savePdf}
          >
            {busy === "pdf" ? "Татаж байна…" : "PDF татах"}
          </button>
        </div>
      </article>
    </div>
  );
}
