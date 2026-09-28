import { ArrowUpRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import CourseMark from "@/components/teaching/CourseMark";
import { TEACHING_BASE, courseColor, coursePath, formatMinutes, lectureCount, useTeachingIndex } from "@/lib/teaching";

// Portfolio section: one card per teaching topic. Everything opens the teaching hub in a new tab.
const TeachingSection = () => {
  const { data, isLoading } = useTeachingIndex();
  const courses = data?.courses ?? [];

  // Hide the section entirely until there is something to show.
  if (!isLoading && !courses.length) return null;

  return (
    <section id="teaching" className="relative py-24 bg-background overflow-hidden">
      <div className="container relative mx-auto px-6">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-3">Teaching</p>
            <h2 className="section-heading mb-4">Lectures I've written</h2>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Free, self-paced notes from CS fundamentals to production system design. Each topic is a set of short
              lectures you can read in one sitting.
            </p>
          </div>
          <Button asChild size="lg" className="group shrink-0 shadow-glow">
            <a href={TEACHING_BASE} target="_blank" rel="noopener noreferrer">
              <GraduationCap className="mr-2 h-4 w-4" />
              Open teaching hub
              <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Button>
        </div>

        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
          {isLoading
            ? [0, 1, 2].map((i) => <div key={i} className="h-48 rounded-2xl glass animate-pulse" />)
            : courses.map((c, i) => {
                const color = courseColor(i);
                return (
                  <a
                    key={c.slug}
                    href={coursePath(c.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-4 rounded-2xl glass p-5 hover-lift"
                  >
                    <div className="flex items-start justify-between">
                      <CourseMark code={c.code} color={color} />
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">{c.title}</h3>
                      {c.description && <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{c.description}</p>}
                    </div>
                    <div className="mt-auto flex flex-wrap gap-1.5 font-mono text-[11px] text-muted-foreground">
                      <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-0.5">{lectureCount(c.lectures.length)}</span>
                      <span className="rounded-full border border-border bg-secondary/60 px-2.5 py-0.5">{formatMinutes(c.minutes)}</span>
                    </div>
                  </a>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default TeachingSection;
