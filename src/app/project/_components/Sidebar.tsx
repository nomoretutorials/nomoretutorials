"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { identicon } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { FaGithub } from "react-icons/fa";

type SidebarProps = {
  id: string;
};

export default function Sidebar({ id }: SidebarProps) {
  const [sidebarWidth, setSidebarWidth] = useState<number>(280);
  const [isDragging, setIsDragging] = useState(false);

  const MIN = 180;
  const MAX = 560;

  const resizerRef = useRef<HTMLDivElement | null>(null);

  const avatarDataUri = useMemo(() => {
    try {
      const svg = createAvatar(identicon, { seed: id }).toString();
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    } catch {
      return "data:image/svg+xml;base64,=";
    }
  }, [id]);

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      if (!isDragging) return;
      const container = resizerRef.current?.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clamped = Math.max(MIN, Math.min(MAX, x));
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
  }, [isDragging]);

  function onPointerDown(e: React.PointerEvent) {
    setIsDragging(true);
    const el = e.currentTarget as HTMLElement;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
  }

  return (
    <>
      <aside
        className={`h-full flex-shrink-0 border-r bg-gradient-to-b from-white/2 to-transparent p-4 transition-shadow duration-150 ${
          isDragging ? "shadow-xl" : "shadow-sm"
        }`}
        style={{ width: sidebarWidth }}
      >
        <div className="flex h-full flex-col gap-4">
          {/* Project header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image
                src={avatarDataUri}
                alt="avatar"
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg border"
              />
              <div>
                <div className="font-semibold">Project</div>
                <div className="text-muted-foreground max-w-[160px] truncate text-sm">{id}</div>
              </div>
            </div>
            <div>
              <FaGithub size={23} />
            </div>
          </div>

          {/* Placeholder content area */}
          <div className="flex-1 space-y-3 overflow-auto">
            <div className="bg-card text-muted-foreground rounded-md p-3 text-sm">
              Add your sidebar content here
            </div>
          </div>

          {/* Footer controls */}
          <div className="flex items-center gap-2">
            <button
              className="text-muted-foreground hover:bg-muted/10 rounded-md px-2 py-1 text-sm"
              onClick={() => setSidebarWidth((w) => (w > 60 ? 56 : 280))}
            >
              {sidebarWidth > 60 ? "Collapse" : "Expand"}
            </button>
            <div className="text-muted-foreground ml-auto text-xs">
              {Math.round(sidebarWidth)}px
            </div>
          </div>
        </div>
      </aside>

      {/* Resizer */}
      <div
        id="resizer"
        ref={resizerRef}
        role="separator"
        aria-orientation="vertical"
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        aria-valuenow={Math.round(sidebarWidth)}
        className={`flex w-3 cursor-col-resize items-center justify-center transition-colors select-none ${
          isDragging ? "bg-muted/10" : "bg-transparent"
        }`}
        onPointerDown={onPointerDown}
        style={{ touchAction: "none" }}
      >
        <div className="bg-muted-foreground/30 h-8 w-px" />
      </div>
    </>
  );
}
