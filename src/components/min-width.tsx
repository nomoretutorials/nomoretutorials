"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { FullscreenIcon } from "lucide-react";

const EXCLUDED_PATHS = ["/auth", "/privacy-policy", "/terms"];

export default function MinWidth({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isTooSmall, setIsTooSmall] = useState(false);

  const isExcluded = EXCLUDED_PATHS.includes(pathname);

  useEffect(() => {
    function handleResize() {
      setIsTooSmall(window.innerWidth < 1200);
    }

    handleResize(); // check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isExcluded) return <>{children}</>;

  if (isTooSmall) {
    return (
      <div className=" max-w-lg mx-auto bg-background flex h-screen w-screen items-center justify-center px-6 text-white">
        <div className="flex flex-col items-start justify-start space-y-10">
          <div className="bg-sidebar rounded-2xl p-4">
            <FullscreenIcon size={"40"} />
          </div>
          <div className="space-y-2.5">
            <h1 className="text-2xl md:text-3xl font-bold">Small screens not supported (yet)</h1>
            <p className="text-gray-400 ">
              We’re still working on making it mobile-friendly.
              For now, please open this on a laptop or PC. 🚀
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
