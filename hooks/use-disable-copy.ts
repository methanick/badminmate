import { useEffect } from "react";

export function useDisableCopy(isEnabled: boolean) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Cmd+C, Ctrl+X, Cmd+X
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "x")) {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEnabled]);
}
