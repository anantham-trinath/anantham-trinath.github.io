import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import TeachingShell from "@/components/teaching/TeachingShell";
import CourseMark from "@/components/teaching/CourseMark";
import AuthorCard from "@/components/teaching/AuthorCard";
import { TeachingLoading, TeachingMessage } from "@/components/teaching/TeachingStates";
import {
  courseColor,
  coursePath,
  formatMinutes,
  lectureCount,
  formatMonth,
  lecturePath,
  pad2,
  useProgress,
  useTeachingIndex,
  type Course,
} from "@/lib/teaching";

const PREVIEW_LECTURES = 4;

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center whitespace-nowrap rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
    {children}
  </span>
);

const CourseCard = ({ course, color, doneCount }: { course: Course; color: string; doneCount: number }) => {
  const pct = Math.round((doneCount / course.lectures.length) * 100);
  const updated = formatMonth(course.updated);
  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-hover"
      style={{ ["--c" as string]: color }}
    >
      <Link to={coursePath(course.slug)} className="flex gap-4 p-5 pb-3">
        <CourseMark code={course.code} color={color} />
        <div className="min-w-0">
          <h3 className="text-lg font-bold tracking-tight">{course.title}</h3>
          {course.description && <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>}
        </div>
      </Link>
      <div className="flex flex-wrap gap-1.5 px-5 pb-3">
        <Chip>{lectureCount(course.lectures.length)}</Chip>
        <Chip>{formatMinutes(course.minutes)}</Chip>
        {updated && <Chip>updated {updated}</Chip>}
        {doneCount > 0 && <Chip>{doneCount}/{course.lectures.length} read</Chip>}
      </div>
      {doneCount > 0 && (
        <div className="mx-5 mb-3 h-1 overflow-hidden rounded-full bg-secondary" aria-label={`${pct}% read`}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        </div>
      )}
      <ol className="border-t border-border py-1.5">
        {course.lectures.slice(0, PREVIEW_LECTURES).map((l) => (
          <li key={l.slug}>
            <Link
              to={lecturePath(course.slug, l.slug)}
              className="flex items-baseline gap-3 px-5 py-2 text-sm transition-colors hover:bg-secondary/60"
            >
              <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground/70 tabular-nums">{pad2(l.number)}</span>
              <span className="min-w-0 flex-1">{l.title}</span>
              <span className="whitespace-nowrap font-mono text-[11px] text-muted-foreground/70">{l.minutes}m</span>
            </Link>
          </li>
        ))}
      </ol>
      {course.lectures.length > PREVIEW_LECTURES && (
        <div className="mt-auto border-t border-border px-5 py-3">
          <Link to={coursePath(course.slug)} className="text-sm font-semibold" style={{ color }}>
            All {course.lectures.length} lectures →
          </Link>
        </div>
      )}
    </article>
  );
};

const TeachingHome = () => {
  const { data, isLoading, error } = useTeachingIndex();
  const { countDone } = useProgress();
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const courses = useMemo(() => data?.courses ?? [], [data]);
  const totals = useMemo(
    () => ({
      lectures: courses.reduce((n, c) => n + c.lectures.length, 0),
      minutes: courses.reduce((n, c) => n + c.minutes, 0),
      updated: courses.map((c) => c.updated).filter(Boolean).sort().pop() ?? null,
    }),
    [courses]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return courses.flatMap((c, i) =>
      c.lectures
        .filter((l) => `${l.title} ${l.description} ${l.tags.join(" ")}`.toLowerCase().includes(q))
        .map((l) => ({ course: c, lecture: l, color: courseColor(i) }))
    );
  }, [courses, query]);

  return (
    <TeachingShell title="Teaching">
      <section className="relative border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 hero-gradient" />
        <div className="container relative mx-auto grid gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">Teaching · Lecture notes</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight [text-wrap:balance] md:text-5xl">
              Computer science, <span className="gradient-text">explained the way I'd explain it to my team.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              Lecture notes on the fundamentals behind the systems I build, written from 12+ years of shipping and
              scaling production software.
            </p>
            {!!courses.length && (
              <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                {[
                  [courses.length, "topics"],
                  [totals.lectures, "lectures"],
                  [formatMinutes(totals.minutes), "of reading"],
                  ...(totals.updated ? [[formatMonth(totals.updated), "last updated"]] : []),
                ].map(([v, l]) => (
                  <div key={String(l)}>
                    <dd className="text-2xl font-extrabold tracking-tight tabular-nums">{v}</dd>
                    <dt className="font-mono text-xs text-muted-foreground">{l}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <AuthorCard className="rounded-2xl border border-border bg-card/80 p-4 shadow-soft" />
        </div>
      </section>

      {isLoading ? (
        <TeachingLoading />
      ) : error ? (
        <TeachingMessage
          title="Couldn't load lectures"
          message="The lecture index didn't load. Refresh the page, or come back in a minute."
          backTo="/"
          backLabel="Back to portfolio"
        />
      ) : !courses.length ? (
        <TeachingMessage title="No lectures yet" message="New topics are on the way." backTo="/" backLabel="Back to portfolio" />
      ) : (
        <div className="container mx-auto px-4 pb-16 sm:px-6">
          <label className="my-6 flex items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="sr-only">Search lectures</span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all lectures, e.g. “paging” or “cache”"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/70"
            />
            <kbd className="hidden rounded border border-border px-1.5 font-mono text-[11px] text-muted-foreground sm:inline">/</kbd>
          </label>

          {results ? (
            results.length ? (
              <ul className="grid gap-2">
                {results.map(({ course, lecture, color }) => (
                  <li key={`${course.slug}/${lecture.slug}`}>
                    <Link
                      to={lecturePath(course.slug, lecture.slug)}
                      className="flex items-baseline gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary"
                    >
                      <span className="whitespace-nowrap font-mono text-xs" style={{ color }}>
                        {course.code} · {pad2(lecture.number)}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold">{lecture.title}</span>
                        {lecture.description && <span className="block text-sm text-muted-foreground">{lecture.description}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No lecture matches “{query.trim()}”. Try a broader word.</p>
            )
          ) : (
            <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr))]">
              {courses.map((c, i) => (
                <CourseCard key={c.slug} course={c} color={courseColor(i)} doneCount={countDone(c)} />
              ))}
            </div>
          )}
        </div>
      )}
    </TeachingShell>
  );
};

export default TeachingHome;
