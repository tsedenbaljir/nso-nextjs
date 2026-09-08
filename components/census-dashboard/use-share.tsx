"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

type Props = {
  onDownload: () => void;
  downloadDisabled?: boolean;
};

function ShareIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <circle cx="5" cy="10" r="2.1" fill="currentColor" />
      <circle cx="15" cy="5" r="2.1" fill="currentColor" />
      <circle cx="15" cy="15" r="2.1" fill="currentColor" />
      <path d="M7 9.2 13 6.2M7 10.8 13 13.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FeedbackIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <path
        d="M4 4.8h12v8.2H8.2L4 16.2V4.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7 8h6M7 10.4h4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <path d="M10 3.5v8.2M6.8 8.8 10 12.2l3.2-3.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 15.2h12" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EmbedIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <path d="M7.2 5.5 3.5 10l3.7 4.5M12.8 5.5 16.5 10l-3.7 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function UseShare({ onDownload, downloadDisabled }: Props) {
  const pathname = usePathname();
  const [embedOpen, setEmbedOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const lng = pathname?.split("/")[1] === "en" ? "en" : "mn";
  const isEmbed = pathname?.includes("/embed/");

  const embedCode = useMemo(() => {
    if (typeof window === "undefined") return "";
    const src = `${window.location.origin}/${lng}/embed/population-census`;
    return `<iframe src="${src}" width="100%" height="720" style="border:0" title="Тооллогын газрын зураг"></iframe>`;
  }, [lng]);

  useEffect(() => {
    if (!embedOpen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEmbedOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [embedOpen]);

  async function shareMap() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Тооллогын газрын зураг", url });
        return;
      }
    } catch {
      /* cancelled */
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function copyEmbed() {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (isEmbed) return null;

  const dialog =
    embedOpen && typeof document !== "undefined"
      ? createPortal(
          <div className="use-share-overlay" role="presentation" onClick={() => setEmbedOpen(false)}>
            <div
              className="use-share-dialog"
              role="dialog"
              aria-labelledby="use-share-embed-title"
              aria-modal="true"
              onClick={(event) => event.stopPropagation()}
            >
              <h3 id="use-share-embed-title">Газрын зургийг ашиглах</h3>
              {/* <p>Доорх кодыг вэб хуудсандаа буулгана уу.</p> */}
              <textarea readOnly rows={4} value={embedCode} />
              <div className="use-share-dialog-actions">
                <button type="button" onClick={() => setEmbedOpen(false)}>
                  Хаах
                </button>
                <button type="button" className="is-primary" onClick={copyEmbed}>
                  Хуулах
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <section className="use-share">
      <h2>Ашиглах, хуваалцах</h2>
      <div className="use-share-grid">
        <button type="button" onClick={onDownload} disabled={downloadDisabled}>
          <DownloadIcon />
          <span>Өгөгдөл татах</span>
        </button>
        <a href={`/${lng}/contact`}>
          <FeedbackIcon />
          <span>Санал өгөх</span>
        </a>
        <button type="button" onClick={shareMap}>
          <ShareIcon />
          <span>Газрын зургийг хуваалцах</span>
        </button>
        <button type="button" onClick={() => setEmbedOpen(true)}>
          <EmbedIcon />
          <span>Газрын зургийг ашиглах</span>
        </button>
      </div>
      {copied ? <p className="use-share-copied">Хуулсан.</p> : null}
      {dialog}
    </section>
  );
}
