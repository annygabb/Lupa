"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const targets = [
  ".editorial-purpose", ".composition-section", ".section-intro",
  ".research-paths article", ".benefit-balance > div", ".mental-invitation",
  ".editorial-closing", ".country-heading", ".hypothesis-strip",
  ".mental-columns article",
].join(",");

/** Progressive enhancement: without JavaScript every section remains readable. */
export function ScrollReveals() {
  const pathname = usePathname();
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(targets));
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | null = null;
    const setup = () => {
      observer?.disconnect();
      if (preference.matches) {
        elements.forEach(el => { el.dataset.revealState = "in"; });
        return;
      }
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const el = entry.target as HTMLElement;
          el.dataset.revealEdge = entry.boundingClientRect.top < 0 ? "top" : "bottom";
          el.dataset.revealState = entry.isIntersecting ? "in" : "out";
        });
      }, { threshold: 0.06 });
      elements.forEach((el, index) => {
        el.classList.add("scroll-reveal");
        // A bounded stagger for siblings; no long waterfall of delayed content.
        el.style.setProperty("--reveal-delay", `${el.matches("article") ? index % 2 * 60 : 0}ms`);
        observer!.observe(el);
      });
    };
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Element) {
        event.target.closest<HTMLElement>(".scroll-reveal")?.setAttribute("data-reveal-state", "in");
      }
    };
    setup();
    preference.addEventListener("change", setup);
    document.addEventListener("focusin", onFocus);
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", setup);
      document.removeEventListener("focusin", onFocus);
      elements.forEach(el => {
        el.classList.remove("scroll-reveal");
        delete el.dataset.revealState;
        delete el.dataset.revealEdge;
        el.style.removeProperty("--reveal-delay");
      });
    };
  }, [pathname]);
  return null;
}
