import { Fragment, useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { TEACHING_BASE } from "@/lib/teaching";

export interface Crumb {
  label: string;
  to?: string;
}

interface TeachingShellProps {
  title: string;
  crumbs?: Crumb[];
  children: ReactNode;
}

const SITE_NAME = "Trinath Anantham";

// Top bar + breadcrumbs shared by every teaching page.
const TeachingShell = ({ title, crumbs = [], children }: TeachingShellProps) => {
  useEffect(() => {
    document.title = `${title} — ${SITE_NAME}`;
  }, [title]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3 sm:px-6">
          <Link to={TEACHING_BASE} className="flex shrink-0 items-center gap-2 font-mono text-sm font-semibold">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs text-primary-foreground">
              TA
            </span>
            <span className="hidden sm:inline">Teaching</span>
          </Link>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
            {crumbs.map((c, i) => (
              // On phones the first crumb ("Teaching") duplicates the logo link, so hide it.
              <Fragment key={`${c.label}-${i}`}>
                {i > 0 && <ChevronRight className={`h-3.5 w-3.5 shrink-0 opacity-60 ${i === 1 ? "hidden sm:block" : ""}`} />}
                {c.to ? (
                  <Link to={c.to} className={`truncate hover:text-foreground ${i === 0 && crumbs.length > 1 ? "hidden sm:inline" : ""}`}>
                    {c.label}
                  </Link>
                ) : (
                  <span className="truncate font-medium text-foreground" aria-current="page">
                    {c.label}
                  </span>
                )}
              </Fragment>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-3">
            <a href="/" className="hidden items-center gap-1.5 text-sm text-muted-foreground hover:text-primary sm:inline-flex">
              <ArrowLeft className="h-3.5 w-3.5" /> Portfolio
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
};

export default TeachingShell;
