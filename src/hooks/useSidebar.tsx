"use client";

import { useEffect, useRef, useState } from "react";

export function useResizableSidebar(id: string, min = 240, max = 560) {
  const [sidebarWidth, setSidebarWidth] = useState<number>(240);
  const [isDragging, setIsDragging] = useState(false);
  const resizerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      if (!isDragging) return;
      const container = resizerRef.current?.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clamped = Math.max(min, Math.min(max, x));
      setSidebarWidth(clamped);
    }

    function handlePointerUp() {
      if (!isDragging) return;
      setIsDragging(false);
      try {
        resizerRef.current?.releasePointerCapture?.(0 as number);
      } catch {}
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, min, max]);

  function onPointerDown(e: React.PointerEvent) {
    setIsDragging(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  }

  return {
    sidebarWidth,
    isDragging,
    resizerRef,
    onPointerDown,
  };
}
