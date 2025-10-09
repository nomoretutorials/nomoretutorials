import { useProjectStore } from "@/store/project-store";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";





export function useProjectNavigation() {
  const router = useRouter();
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const { hasUnsavedChanges, resetState, setHasUnsavedChanges, isNavigating, setIsNavigating } =
    useProjectStore();

  // Handle browser back button
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    window.history.pushState(null, "", window.location.href);

    const preventBackNavigation = () => {
      window.history.pushState(null, "", window.location.href);
      setShowUnsavedDialog(true);
    };

    window.addEventListener("popstate", preventBackNavigation);
    return () => window.removeEventListener("popstate", preventBackNavigation);
  }, [hasUnsavedChanges]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleBackToDashboard = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      setIsNavigating(true);
      resetState();

      setTimeout(() => {
        Promise.resolve(router.push("/")).finally(() => {
          setIsNavigating(false);
        });
      }, 1000)
    }
  }, [hasUnsavedChanges, router, resetState, setIsNavigating]);

  const handleConfirmNavigation = useCallback(() => {
    setShowUnsavedDialog(false);
    setHasUnsavedChanges(false);
    resetState();
    setTimeout(() => router.push("/"), 0);
  }, [resetState, router, setHasUnsavedChanges]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setShowUnsavedDialog(false);
      window.history.pushState(null, "", window.location.href);
    }
  }, []);

  return {
    showUnsavedDialog,
    handleBackToDashboard,
    handleConfirmNavigation,
    handleDialogOpenChange,
  };
}