import { cn } from "@/lib/utils";

interface CourseMarkProps {
  code: string;
  color: string;
  className?: string;
}

// Two-letter tile tinted with the course colour, e.g. "OS", "SD".
const CourseMark = ({ code, color, className }: CourseMarkProps) => (
  <span
    aria-hidden
    className={cn(
      "inline-grid h-11 w-11 shrink-0 place-items-center rounded-xl border font-mono text-sm font-semibold",
      className
    )}
    style={{
      color,
      background: `color-mix(in srgb, ${color} 13%, transparent)`,
      borderColor: `color-mix(in srgb, ${color} 32%, transparent)`,
    }}
  >
    {code}
  </span>
);

export default CourseMark;
