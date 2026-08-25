"use client";

import { useEffect, type RefObject } from "react";

export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const raw = ref.current;
    if (!raw) return;
    const node: HTMLElement = raw;

    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    function onDown(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      if (event.button !== 0) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startY = event.clientY;
      startLeft = node.scrollLeft;
      startTop = node.scrollTop;
      node.classList.add("is-dragging");
    }

    function onMove(event: PointerEvent) {
      if (!dragging) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 5) return;
      moved = true;
      node.scrollLeft = startLeft - dx;
      node.scrollTop = startTop - dy;
    }

    function onUp() {
      if (!dragging) return;
      dragging = false;
      node.classList.remove("is-dragging");
      if (moved) node.dataset.dragged = "1";
    }

    function onClick(event: MouseEvent) {
      if (node.dataset.dragged === "1") {
        event.preventDefault();
        event.stopPropagation();
        delete node.dataset.dragged;
      }
    }

    node.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    node.addEventListener("click", onClick, true);
    return () => {
      node.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      node.removeEventListener("click", onClick, true);
    };
  }, [ref]);
}
