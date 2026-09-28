import { useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import profile from "@/data/profile";
import TeachingShell from "@/components/teaching/TeachingShell";
import CourseMark from "@/components/teaching/CourseMark";
import LectureMarkdown from "@/components/teaching/LectureMarkdown";
import TableOfContents from "@/components/teaching/TableOfContents";
import ReadingProgress from "@/components/teaching/ReadingProgress";
import { useHeadings } from "@/components/teaching/useHeadings";
import { TeachingLoading, TeachingMessage } from "@/components/teaching/TeachingStates";
import {
  TEACHING_BASE,
  courseColor,
  coursePath,
  findCourse,
  lectureKey,
  lecturePath,
  pad2,
  stripLectureHeader,
  useLectureMarkdown,
  useProgress,
  useTeachingIndex,
} from "@/lib/teaching";

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center whitespace-nowrap rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
    {children}
  </span>
);

const LecturePage = () => {
  const { courseSlug, lectureSlug } = useParams<{ courseSlug: string; lectureSlug: string }>();
  const navigate = useNavigate();
  const index = useTeachingIndex();
  const { course, position } = findCourse(index.data, courseSlug);
  const lecture = course?.lectures.find((l) => l.slug === lectureSlug);
  const md = useLectureMarkdown(course?.slug, lecture?.file);
  const { isDone, toggle } = useProgress();

  const articleRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const body = useMemo(() => (md.data ? stripLectureHeader(md.data) : ""), [md.data]);
  const { headings, activeId } = useHeadings(bodyRef, body);

  useEffect(() => {
    if (!body) return;
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash) document.getElementById(hash)?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [body]);

  const baseCrumbs = [{ label: "Teaching", to: TEACHING_BASE }];

  if (index.isLoading || md.isLoading) {
    return (
      <TeachingShell title={lecture?.title ?? "Teaching"} crumbs={baseCrumbs}>
        <TeachingLoading />
      </TeachingShell>
    );
  }

  if (index.error || !course || !lecture || md.error) {
    const missing = !index.error && (!course || !lecture);
    return (
      <TeachingShell title="Teaching" crumbs={baseCrumbs}>
        <TeachingMessage
          title={missing ? "Lecture not found" : "Couldn't load this lecture"}
          message={missing ? "It may have been renamed or moved to another topic." : "Refresh the page, or try again in a minute."}
          backTo={course ? coursePath(course.slug) : TEACHING_BASE}
          backLabel={course ? `Back to ${course.title}` : "All topics"}
        />
      </TeachingShell>
    );
  }

  const color = courseColor(position);
  const key = lectureKey(course.slug, lecture.slug);
  const read = isDone(key);
  const i = course.lectures.indexOf(lecture);
  const prev = course.lectures[i - 1];
  const next = course.lectures[i + 1];
  const updated = lecture.date
    ? new Date(lecture.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <TeachingShell
      title={lecture.title}
      crumbs={[...baseCrumbs, { label: course.title, to: coursePath(course.slug) }, { label: `Lecture ${pad2(lecture.number)}` }]}
    >
      <ReadingProgress targetRef={articleRef} />
      <div className="container mx-auto grid gap-10 px-4 py-8 pb-20 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)_200px]">
        {/* Lectures in this course */}
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-auto">
          <Link to={coursePath(course.slug)} className="mb-4 flex items-center gap-2.5 text-sm font-bold hover:text-primary">
            <CourseMark code={course.code} color={color} className="h-8 w-8 rounded-lg text-[11px]" />
            {course.title}
          </Link>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/80">Lectures</p>
          <ol className="border-l border-border">
            {course.lectures.map((l) => {
              const current = l.slug === lecture.slug;
              return (
                <li key={l.slug}>
                  <Link
                    to={lecturePath(course.slug, l.slug)}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "-ml-px flex gap-2 border-l-2 px-3 py-1.5 text-[13px] leading-snug transition-colors",
                      current ? "font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                    style={current ? { borderColor: color } : undefined}
                  >
                    <span className="shrink-0 pt-px font-mono text-[11px] text-muted-foreground/70">{pad2(l.number)}</span>
                    <span className="min-w-0 flex-1">{l.title}</span>
                    {isDone(lectureKey(course.slug, l.slug)) && <Check className="h-3.5 w-3.5 shrink-0" style={{ color }} />}
                  </Link>
                </li>
              );
            })}
          </ol>
        </aside>

        <article ref={articleRef} className="min-w-0">
          {/* Lecture picker for phones and tablets */}
          <label className="mb-5 flex items-center gap-2 lg:hidden">
            <span className="sr-only">Jump to lecture</span>
            <select
              value={lecture.slug}
              onChange={(e) => navigate(lecturePath(course.slug, e.target.value))}
              className="min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
            >
              {course.lectures.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {pad2(l.number)} · {l.title}
                </option>
              ))}
            </select>
          </label>

          <header className="mb-8 border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.14em]" style={{ color }}>
                {course.title} · Lecture {pad2(lecture.number)}
              </span>
              <Chip>{lecture.minutes} min read</Chip>
              {lecture.tags.map((t) => (
                <Chip key={t}>#{t}</Chip>
              ))}
            </div>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight [text-wrap:balance] md:text-[2.6rem]">
              {lecture.title}
            </h1>
            {lecture.description && (
              <p className="mt-3 max-w-[62ch] font-serif text-lg leading-relaxed text-muted-foreground md:text-xl">
                {lecture.description}
              </p>
            )}
            <div className="mt-5 flex items-center gap-2.5 text-sm text-muted-foreground">
              <img src={profile.personal.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
              <span>
                <span className="font-semibold text-foreground">{profile.personal.name}</span>
                {updated && ` · ${updated}`}
              </span>
            </div>
          </header>

          <div ref={bodyRef}>
            <LectureMarkdown markdown={body} />
          </div>

          <div className="mt-10 flex max-w-[70ch] flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
            <p className="min-w-[200px] flex-1 text-sm text-muted-foreground">
              Finished this lecture? Mark it done. Progress is saved in this browser.
            </p>
            <Button variant={read ? "default" : "outline"} onClick={() => toggle(key)}>
              {read ? (
                <>
                  <Check className="mr-1.5 h-4 w-4" /> Done
                </>
              ) : (
                "Mark as done"
              )}
            </Button>
          </div>

          <nav aria-label="Lecture navigation" className="mt-6 grid max-w-[70ch] gap-3 sm:grid-cols-2">
            {prev ? (
              <Link
                to={lecturePath(course.slug, prev.slug)}
                className="rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary"
              >
                <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">← Previous</span>
                <span className="font-semibold">{prev.title}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            <Link
              to={next ? lecturePath(course.slug, next.slug) : coursePath(course.slug)}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-right transition-colors hover:border-primary"
            >
              <span className="block font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                {next ? "Next →" : "Finished"}
              </span>
              <span className="font-semibold">{next ? next.title : `Back to ${course.title}`}</span>
            </Link>
          </nav>
        </article>

        <aside className="hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-auto">
          <TableOfContents headings={headings} activeId={activeId} />
        </aside>
      </div>
    </TeachingShell>
  );
};

export default LecturePage;
