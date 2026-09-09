"use client";

type Props = {
  onHome: () => void;
  onDownload?: () => void;
  downloadDisabled?: boolean;
};

export default function MapToolbar({ onHome, onDownload, downloadDisabled }: Props) {
  return (
    <div className="map-toolbar">
      <button type="button" title="Эхлэл" aria-label="Эхлэл" onClick={onHome}>
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <path
            d="M3.5 9.5 10 4l6.5 5.5V17h-4.2v-5H7.7v5H3.5V9.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </button>
      {onDownload ? (
        <button
          type="button"
          title="Өгөгдөл татах"
          aria-label="Өгөгдөл татах"
          disabled={downloadDisabled}
          onClick={onDownload}
        >
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            <path
              d="M10 3.5v8.2M7 9.2 10 12.4 13 9.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 14.5v1.2h12v-1.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
