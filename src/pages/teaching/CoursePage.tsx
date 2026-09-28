import { Link, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import TeachingShell from "@/components/teaching/TeachingShell";
import CourseMark from "@/components/teaching/CourseMark";
import AuthorCard from "@/components/teaching/AuthorCard";
import { TeachingLoading, TeachingMessage } from "@/components/teaching/TeachingStates";
import {
  TEACHING_BASE,
  courseColor,
  coursePath,
  findCourse,
  formatMinutes,
  lectureCount,
  formatMonth,
  lectureKey,
  lecturePath,
  pad2,
  useProgress,
  useTeachingIndex,
} from "@/lib/teaching";

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center whitespace-nowrap rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
    {children}
  </span>
);

const AsideCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{title}</p>
    {children}
  </div>
);

const CoursePage = () => {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const { data, isLoading, error } = useTeachingIndex();
  const { isDone, countDone } = useProgress();
  const { course, position } = findCourse(data, courseSlug);

  if (isLoading || error || !course) {
    return (
      <TeachingShell title="Teaching" crumbs={[{ label: "Teaching", to: TEACHING_BASE }]}>
        {isLoading ? (
          <TeachingLoading />
        ) : (
          <TeachingMessage
            title={error ? "Couldn't load this topic" : "Topic not found"}
            message={error ? "Refresh the page, or try again in a minute." : "This topic may have been renamed or removed."}
          />
        )}
      </TeachingShell>
    );
  }

  const color = courseColor(position);
  const done = countDone(course);
  const next = course.lectures.find((l) => !isDone(lectureKey(course.slug, l.slug))) ?? course.lectures[0];
  const updated = formatMonth(course.updated);
  const others = data!.courses.map((c, i) => ({ c, color: courseColor(i) })).filter(({ c }) => c.slug !== course.slug);

  return (
    <TeachingShell title={course.title} crumbs={[{ label: "Teaching", to: TEACHING_BASE }, { label: course.title }]}>
      <section
        className="border-b border-border/60"
        style={{ background: `radial-gradient(ellipse 60% 90% at 0% 0%, color-mix(in srgb, ${color} 12%, transparent), transparent 65%)` }}
      >
        <div className="container mx-auto flex flex-wrap items-start gap-5 px-4 py-10 sm:px-6">
          <CourseMark code={course.code} color={color} className="h-16 w-16 rounded-2xl text-xl" />
          <div className="min-w-[240px] flex-1">
            <p className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color }}>
              Topic · {course.code}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-5xl">{course.title}</h1>
            {course.description && <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">{course.description}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip>{lectureCount(course.lectures.length)}</Chip>
              <Chip>{formatMinutes(course.minutes)} total</Chip>
              {updated && <Chip>updated {updated}</Chip>}
              <Chip>{done}/{course.lectures.length} read</Chip>
            </div>
            <Button asChild size="lg" className="mt-6 shadow-glow">
              <Link to={lecturePath(course.slug, next.slug)}>
                {done ? "Continue" : "Start"} with Lecture {pad2(next.number)} →
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto grid gap-8 px-4 py-8 pb-16 sm:px-6 lg:grid-cols-[1fr_300px]">
        <ol className="flex flex-col gap-3">
          {course.lectures.map((l) => {
            const read = isDone(lectureKey(course.slug, l.slug));
            return (
              <li key={l.slug}>
                <Link
                  to={lecturePath(course.slug, l.slug)}
                  className="grid grid-cols-[auto_1fr_auto] items-start gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-smooth hover:translate-x-0.5 hover:border-[var(--c)]"
                  style={{ ["--c" as string]: color }}
                >
                  <span
                    className="mt-0.5 rounded-lg border px-2 py-0.5 font-mono text-xs tabular-nums"
                    style={{ color, borderColor: `color-mix(in srgb, ${color} 35%, transparent)` }}
                  >
                    L{pad2(l.number)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold">{l.title}</h2>
                    {l.description && <p className="mt-1 text-sm text-muted-foreground">{l.description}</p>}
                    {!!l.tags.length && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {l.tags.map((t) => (
                          <Chip key={t}>#{t}</Chip>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                    <span
                      className="grid h-5 w-5 place-items-center rounded-full border"
                      style={read ? { background: color, borderColor: color } : undefined}
                      aria-label={read ? "Read" : "Not read yet"}
                    >
                      {read && <Check className="h-3 w-3 text-background" />}
                    </span>
                    {l.minutes} min
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <AsideCard title="Your instructor">
            <AuthorCard compact />
          </AsideCard>
          {others.length > 0 && (
            <AsideCard title="Other topics">
              <div className="flex flex-col gap-2">
                {others.map(({ c, color: oc }) => (
                  <Link
                    key={c.slug}
                    to={coursePath(c.slug)}
                    className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm transition-colors hover:border-primary"
                  >
                    <span className="font-mono text-xs" style={{ color: oc }}>
                      {c.code}
                    </span>
                    <span className="font-medium">{c.title}</span>
                  </Link>
                ))}
              </div>
            </AsideCard>
          )}
        </aside>
      </div>
    </TeachingShell>
  );
};

export default CoursePage;
