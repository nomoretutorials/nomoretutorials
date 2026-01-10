"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { FullscreenIcon, LoaderCircleIcon, LogOutIcon } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";

const EXCLUDED_PATHS = ["/auth", "/privacy-policy", "/terms"];

export default function MinWidth({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isExcluded = EXCLUDED_PATHS.includes(pathname);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth");
          },
        },
      });
    } catch {
      toast.error("Error Signing Out");
    } finally {
      setLoading(false);
    }
  };

  if (isExcluded) return <>{children}</>;

  return (
    <>
      <div className="ui-scale-wrapper hidden lg:block">{children}</div>

      <div className="bg-background relative mx-auto flex h-screen w-screen max-w-lg items-center justify-center px-6 text-white xl:hidden">
        <Button
          className="absolute top-6 right-6 rounded-2xl"
          variant="outline"
          onClick={handleSignOut}
        >
          {loading ? (
            <div className="animate-spin">
              <LoaderCircleIcon />
            </div>
          ) : (
            <>
              <LogOutIcon />
              <span>Sign Out</span>
            </>
          )}
        </Button>
        <div className="flex flex-col items-start justify-start space-y-10">
          <div className="bg-sidebar rounded-2xl p-4">
            <FullscreenIcon size="40" />
          </div>
          <div className="space-y-2.5">
            <h1 className="text-2xl font-bold md:text-3xl">Small screens not supported (yet)</h1>
            <p className="text-gray-400">
              We&apos;re still working on making it mobile-friendly. For now, please open this on a
              laptop or PC. 🚀
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
