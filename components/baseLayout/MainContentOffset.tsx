"use client";

import { type ReactNode, useEffect } from "react";

/**
 * `.nso_header` нь fixed тул үндсэн агуулгыг доошлуулна.
 * --header-h нь socio-dashboard болон бусад хуудсуудад ашиглагдана.
 */
export default function MainContentOffset({ children }: { children: ReactNode }) {
  useEffect(() => {
    const el = document.querySelector(".nso_header");
    if (!(el instanceof HTMLElement)) return;

    const measure = () => {
      const h = el.offsetHeight;
      if (h > 0) {
        document.documentElement.style.setProperty("--header-h", `${h}px`);
      }
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      ro?.disconnect();
    };
  }, []);

  return <div className="nso-main-below-header">{children}</div>;
}
