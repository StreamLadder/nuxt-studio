const DEFAULT_SIDEBAR_WIDTH = 440;
const SIDEBAR_WIDTH_STORAGE_KEY = "studio-sidebar-width";
export function getSidebarWidth() {
  if (typeof window !== "undefined" && window.localStorage) {
    const savedWidth = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    if (savedWidth) {
      const width = Number.parseInt(savedWidth, 10);
      if (!Number.isNaN(width)) {
        return width;
      }
    }
  }
  return DEFAULT_SIDEBAR_WIDTH;
}
export function adjustFixedElements(sidebarWidth) {
  document.querySelectorAll("*").forEach((el) => {
    const htmlEl = el;
    if (window.getComputedStyle(htmlEl).position === "fixed") {
      htmlEl.style.left = sidebarWidth > 0 ? `${sidebarWidth}px` : "";
    }
  });
}
export function getHostStyles() {
  const currentWidth = getSidebarWidth();
  return {
    "body[data-studio-active]": {
      transition: "margin 0.2s ease"
    },
    "body[data-studio-active][data-expand-sidebar]": {
      marginLeft: `${currentWidth}px`
    }
  };
}
