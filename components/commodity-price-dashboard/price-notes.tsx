"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import {
  CPI_PRICE_NOTE,
  MARKET_PRICE_NOTE,
  PPI_BORDER_PRODUCTS,
  PPI_BORDER_NOTE,
  PPI_PRODUCER_NOTE,
  PPI_PRODUCER_PRODUCTS,
} from "@/lib/commodity-price-dashboard/price-notes";

type Trigger = "click" | "hover";

type PopoverCoords = {
  top: number;
  left: number;
};

function PriceInfoPopover({
  label,
  children,
  trigger = "click",
}: {
  label: string;
  children: ReactNode;
  trigger?: Trigger;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<PopoverCoords | null>(null);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const usePortal = trigger === "click";

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open || !usePortal || !btnRef.current) {
      setCoords(null);
      return;
    }

    function update() {
      const btn = btnRef.current;
      const pop = popoverRef.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const gap = 8;
      const height = pop?.offsetHeight ?? 240;
      let top = rect.bottom + gap;

      if (top + height > window.innerHeight - gap) {
        top = rect.top - gap - height;
      }

      top = Math.max(gap, top);

      setCoords({
        top,
        left: rect.left + rect.width / 2,
      });
    }

    update();
    requestAnimationFrame(update);

    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, usePortal, children]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open || trigger !== "click") return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, trigger]);

  const hoverHandlers =
    trigger === "hover"
      ? {
          onMouseEnter: () => setOpen(true),
          onMouseLeave: () => setOpen(false),
          onFocus: () => setOpen(true),
          onBlur: (event: FocusEvent<HTMLDivElement>) => {
            if (!rootRef.current?.contains(event.relatedTarget as Node)) {
              setOpen(false);
            }
          },
        }
      : {};

  function toggleOpen(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setOpen((value) => !value);
  }

  const popover = (
    <div
      id={id}
      ref={popoverRef}
      className={`price-info-popover${usePortal ? " price-info-popover--fixed" : ""}`}
      role={trigger === "click" ? "dialog" : "tooltip"}
      aria-label={label}
      style={
        usePortal && coords
          ? { top: coords.top, left: coords.left }
          : usePortal
            ? { visibility: "hidden", top: 0, left: 0 }
            : undefined
      }
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  );

  return (
    <div className="price-info" ref={rootRef} {...hoverHandlers}>
      <button
        ref={btnRef}
        type="button"
        className="price-info-btn"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={trigger === "click" ? toggleOpen : undefined}
      >
        <Info aria-hidden />
      </button>
      {open && !usePortal ? popover : null}
      {open && usePortal && mounted
        ? createPortal(popover, document.querySelector(".nso-price-dash") ?? document.body)
        : null}
    </div>
  );
}

export function WeeklyPriceInfo() {
  return (
    <PriceInfoPopover label="Зах зээлийн үнэ — тайлбар" trigger="hover">
      <section className="price-notes-block">
        <h3 className="price-notes-title">Зах зээлийн үнэ</h3>
        <p className="price-notes-text">{MARKET_PRICE_NOTE}</p>
      </section>
    </PriceInfoPopover>
  );
}

export function PpiStars({ count }: { count: 0 | 1 | 2 }) {
  if (!count) return null;

  const label = count === 1 ? PPI_BORDER_NOTE : PPI_PRODUCER_NOTE;

  return (
    <span className="ppi-stars" title={label} aria-label={label}>
      {"★".repeat(count)}
    </span>
  );
}

export function WeeklyPpiLegend() {
  return (
    <div className="week-ppi-legend">
      <p className="week-ppi-legend-item">
        <PpiStars count={1} />
        <span>{PPI_BORDER_NOTE}</span>
      </p>
      <p className="week-ppi-legend-item">
        <PpiStars count={2} />
        <span>{PPI_PRODUCER_NOTE}</span>
      </p>
    </div>
  );
}

export function CpiPriceInfo() {
  return (
    <PriceInfoPopover label="Хэрэглээний үнэ — тайлбар" trigger="click">
      <section className="price-notes-block">
        <p className="price-notes-text">{CPI_PRICE_NOTE}</p>
      </section>
    </PriceInfoPopover>
  );
}

export function PpiPriceInfo() {
  return (
    <PriceInfoPopover label="Үйлдвэрлэгчийн үнэ — тайлбар" trigger="click">
      <section className="price-notes-block">
        <h3 className="price-notes-title">Гаалийн ерөнхий газрын мэдээллийн санг ашиглан нэгжийн үнийг тооцсон.</h3>
        <ul className="price-notes-list">
          {PPI_BORDER_PRODUCTS.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </section>

      <section className="price-notes-block">
        <h3 className="price-notes-title">Үйлдвэрлэгчийн үнэ.</h3>
        <ul className="price-notes-list">
          {PPI_PRODUCER_PRODUCTS.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </section>
    </PriceInfoPopover>
  );
}
