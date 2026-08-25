"use client";

type Props = {
  onHome: () => void;
};

export default function MapToolbar({ onHome }: Props) {
  return (
    <div className="map-toolbar">
      <button type="button" title="Эхлэл" onClick={onHome}>
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <path d="M3.5 9.5 10 4l6.5 5.5V17h-4.2v-5H7.7v5H3.5V9.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  );
}
