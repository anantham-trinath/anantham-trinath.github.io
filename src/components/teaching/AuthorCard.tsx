import { Github, Linkedin, Globe } from "lucide-react";
import profile from "@/data/profile";
import { cn } from "@/lib/utils";

interface AuthorCardProps {
  compact?: boolean;
  className?: string;
}

const AuthorCard = ({ compact = false, className }: AuthorCardProps) => {
  const { personal, socials, stats } = profile;
  const years = stats.find((s) => /years engineering/i.test(s.label));

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <img
        src={personal.avatar}
        alt={personal.name}
        className={cn(
          "shrink-0 rounded-full object-cover ring-2 ring-primary/30",
          compact ? "h-12 w-12" : "h-14 w-14"
        )}
      />
      <div className="min-w-0">
        <p className="font-semibold leading-tight">{personal.name}</p>
        <p className="text-sm text-muted-foreground leading-snug">
          {compact && years ? `${personal.title.split("·")[0].trim()} · ${years.value}${years.suffix} yrs` : personal.title}
        </p>
        {!compact && <p className="text-sm text-muted-foreground leading-snug">{personal.tagline}</p>}
        <div className="mt-1.5 flex flex-wrap gap-3 text-xs">
          <a href={socials.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
            <Github className="h-3.5 w-3.5" /> GitHub
          </a>
          <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
          </a>
          <a href="/" className="inline-flex items-center gap-1 text-primary hover:underline">
            <Globe className="h-3.5 w-3.5" /> Portfolio
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthorCard;
