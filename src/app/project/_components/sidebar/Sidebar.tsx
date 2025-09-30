import Image from "next/image";
import { useMemo } from "react";
import { identicon } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { FaGithub } from "react-icons/fa";

import { useResizableSidebar } from "@/hooks/useSidebar";
import SidebarSteps from "./SidebarSteps";

type SidebarProps = {
  id: string;
};

export default function Sidebar({ id }: SidebarProps) {
  const { sidebarWidth, isDragging, resizerRef, onPointerDown } = useResizableSidebar(id);

  const avatarDataUri = useMemo(() => {
    try {
      const svg = createAvatar(identicon, { seed: id }).toString();
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    } catch {
      return "data:image/svg+xml;base64,=";
    }
  }, [id]);

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

          <div className="flex-1 space-y-3 overflow-auto">
            <SidebarSteps />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-muted-foreground ml-auto text-xs">
              {Math.round(sidebarWidth)}px
            </div>
          </div>
        </div>
      </aside>

      <div
        id="resizer"
        ref={resizerRef}
        role="separator"
        aria-orientation="vertical"
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
