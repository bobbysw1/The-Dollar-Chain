"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Forces every newly-opened page to start at the top, regardless of where the
 *  previous page was scrolled (some browsers restore the old scroll position). */
export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
