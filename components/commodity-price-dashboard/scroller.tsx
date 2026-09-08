"use client";

import { useRef, type ReactNode } from "react";
import { useDragScroll } from "./use-drag-scroll";

export function Scroller({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useDragScroll(ref);
  return (
    <div ref={ref} className="scroller">
      {children}
    </div>
  );
}
