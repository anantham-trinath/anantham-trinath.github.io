import { useEffect, useState, type RefObject } from "react";

export interface HeadingItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const ACTIVE_OFFSET_PX = 120;

// Reads h2/h3 from the rendered article (so ids always match the DOM) and
// tracks which one the reader is currently in.
export function useHeadings(containerRef: RefObject<HTMLElement>, contentKey: string) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const seen = new Map<string, number>();
    const items = Array.from(root.querySelectorAll<HTMLElement>("h2, h3")).map((el) => {
      // De-duplicate ids for repeated headings like "Example".
      const count = seen.get(el.id) ?? 0;
      seen.set(el.id, count + 1);
      if (count > 0) el.id = `${el.id}-${count + 1}`;
      return { id: el.id, text: el.textContent ?? "", level: el.tagName === "H2" ? 2 : 3 } as HeadingItem;
    });
    setHeadings(items);
    setActiveId(null);
  }, [containerRef, contentKey]);

  useEffect(() => {
    if (!headings.length) return;
    const onScroll = () => {
      let current: string | null = null;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top < ACTIVE_OFFSET_PX) current = h.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [headings]);

  return { headings, activeId };
}
