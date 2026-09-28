import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEACHING_BASE } from "@/lib/teaching";

export const TeachingLoading = () => (
  <div className="container mx-auto space-y-4 px-4 py-12 sm:px-6" aria-busy="true" aria-label="Loading">
    <div className="h-10 w-2/3 animate-pulse rounded-lg bg-muted" />
    <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
    <div className="grid gap-4 pt-6 md:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  </div>
);

interface TeachingMessageProps {
  title: string;
  message: string;
  backTo?: string;
  backLabel?: string;
}

export const TeachingMessage = ({
  title,
  message,
  backTo = TEACHING_BASE,
  backLabel = "All topics",
}: TeachingMessageProps) => (
  <div className="container mx-auto px-4 py-24 text-center sm:px-6">
    <h1 className="mb-3 text-3xl font-bold tracking-tight">{title}</h1>
    <p className="mx-auto mb-8 max-w-md text-muted-foreground">{message}</p>
    <Button asChild variant="outline">
      <Link to={backTo}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {backLabel}
      </Link>
    </Button>
  </div>
);
