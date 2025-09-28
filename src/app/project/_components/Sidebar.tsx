"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createAvatar } from "@dicebear/core";
import { identicon } from "@dicebear/collection";
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
        className={`flex-shrink-0 h-full border-r bg-gradient-to-b from-white/2 to-transparent p-4 transition-shadow duration-150 ${
          isDragging ? "shadow-xl" : "shadow-sm"
        }`}
        style={{ width: sidebarWidth }}
      >
        <div className="h-full flex flex-col gap-4">
          {/* Project header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image
                src={avatarDataUri}
                alt="avatar"
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg border"
              />
              <div>
                <div className="font-semibold">Project</div>
                <div className="text-sm text-muted-foreground truncate max-w-[160px]">
                  {id}
                </div>
              </div>
            </div>
            <div>
              <FaGithub size={23} />
            </div>
          </div>

          {/* Placeholder content area */}
          <div className="flex-1 overflow-auto space-y-3">
            <div className="rounded-md p-3 bg-card text-sm text-muted-foreground">
              Add your sidebar content here
            </div>
          </div>

          {/* Footer controls */}
          <div className="flex items-center gap-2">
            <button
              className="text-sm text-muted-foreground px-2 py-1 rounded-md hover:bg-muted/10"
              onClick={() => setSidebarWidth((w) => (w > 60 ? 56 : 280))}
            >
              {sidebarWidth > 60 ? "Collapse" : "Expand"}
            </button>
            <div className="text-xs text-muted-foreground ml-auto">
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
        className={`w-3 cursor-col-resize flex items-center justify-center select-none transition-colors ${
          isDragging ? "bg-muted/10" : "bg-transparent"
        }`}
        onPointerDown={onPointerDown}
        style={{ touchAction: "none" }}
      >
        <div className="h-8 w-px bg-muted-foreground/30" />
      </div>
    </>
  );
}
