import { useEffect, useState, type RefObject } from "react";

interface ReadingProgressProps {
  targetRef: RefObject<HTMLElement>;
}

// Thin bar under the top bar that fills as the reader scrolls through the article.
const ReadingProgress = ({ targetRef }: ReadingProgressProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = targetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const value = scrollable <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / scrollable));
      setProgress(value);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetRef]);

  return (
    <div className="fixed inset-x-0 top-[57px] z-40 h-0.5" aria-hidden>
      <div
        className="h-full bg-gradient-to-r from-primary to-accent transition-[width] duration-100 ease-linear"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
};

export default ReadingProgress;
