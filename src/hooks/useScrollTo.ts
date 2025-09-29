import React from "react";

export const useScrollTo = () => {
  const scrollToElement = React.useCallback(
    (elementId: string, offset = 25, containerSelector = ".overflow-y-auto") => {
      try {
        const el = document.getElementById(elementId);
        if (!el) return;

        const scrollContainer = el.closest(containerSelector);
        if (!scrollContainer) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = el.getBoundingClientRect();
        const scrollOffset = elementRect.top - containerRect.top - offset;

        scrollContainer.scrollTo({
          top: scrollContainer.scrollTop + scrollOffset,
          behavior: "smooth",
        });
      } catch (error) {
        console.error("Error scrolling to element:", error);
      }
    },
    []
  );

  return scrollToElement;
};
