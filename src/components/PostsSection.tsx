import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Calendar, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import profile from "@/data/profile";

interface Post {
  title: string;
  summary: string;
  date: string;
  readTime: string;
  tags: string[];
  slug: string;
  filePath: string;
  mdContent: string;
}

const PostsSection = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const files = await Promise.all(
          profile.posts.map(async (file) => {
            try {
              const res = await fetch(file.path);
              if (!res.ok) return null;
              const content = await res.text();
              return { ...file, content };
            } catch {
              return null;
            }
          })
        );

        const valid = files
          .filter((f): f is NonNullable<typeof f> => !!f)
          .map((file) => {
            const content = file.content;
            const dateMatch = content.match(/\*\*Published:\*\*\s*([^\n]+)/i);
            let postDate = new Date().toISOString().split("T")[0];
            if (dateMatch) {
              const parsed = new Date(dateMatch[1].trim());
              if (!isNaN(parsed.getTime())) {
                postDate = parsed.toISOString().split("T")[0];
              }
            }
            return {
              title: extractTitle(content, file.name),
              summary: extractSummary(content),
              date: postDate,
              readTime: calculateReadTime(content),
              tags: extractTags(content),
              slug: file.name.replace(".md", ""),
              filePath: file.path,
              mdContent: content,
            };
          })
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

        setPosts(valid);
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const extractTitle = (content: string, filename: string): string => {
    const m =
      content.match(/^#\s+(.+)$/m) ||
      content.match(/title:\s*['"]?([^'"\n]+)['"]?/);
    return m ? m[1].trim() : filename.replace(".md", "").replace(/-/g, " ");
  };

  const extractSummary = (content: string): string => {
    const desc = content.match(
      /\*\*Description:\*\*\s*([\s\S]*?)(?=\n\n|\n---|\n##|\n###|\n#)/i
    );
    if (desc) return desc[1].trim();
    const fall =
      content.match(/summary:\s*['"]?([^'"\n]+)['"]?/) ||
      content.match(/description:\s*['"]?([^'"\n]+)['"]?/);
    if (fall) return fall[1].trim();
    const lines = content.split("\n").filter((l) => l.trim());
    const first = lines.find(
      (l) => !l.startsWith("#") && !l.includes(":") && l.length > 50
    );
    return first ? first.substring(0, 160) + "..." : "No summary available";
  };

  const extractTags = (content: string): string[] => {
    const m = content.match(/\*\*Tags:\*\*\s*([^\n]+)/i);
    if (m) {
      return m[1]
        .split(",")
        .map((t) => t.trim().replace(/['"\[\]]/g, ""));
    }
    const fb =
      content.match(/tags:\s*\[(.*?)\]/s) || content.match(/tags:\s*([^\n]+)/i);
    if (fb) {
      return fb[1]
        .split(",")
        .map((t) => t.trim().replace(/['"\[\]]/g, ""));
    }
    return ["Technical", "Blog"];
  };

  const calculateReadTime = (content: string): string => {
    const words = content.split(/\s+/).length;
    return `${Math.ceil(words / 200)} min read`;
  };

  const handlePostClick = (slug: string, filePath: string) => {
    navigate(`/post/${slug}?path=${encodeURIComponent(filePath)}`);
  };

  return (
    <section id="posts" className="relative py-24 bg-background overflow-hidden">
      <div className="absolute inset-0 hero-gradient opacity-40 pointer-events-none" />
      <div className="container relative mx-auto px-6">
        <div className="text-center mb-14">
          <p className="eyebrow mb-3">Writing</p>
          <h2 className="section-heading mb-4">Notes & Articles</h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Lessons from building scalable systems, leading engineering teams,
            and shipping developer tools used by millions.
          </p>
        </div>

        {loading ? (
          <div className="max-w-4xl mx-auto grid gap-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-32 rounded-2xl glass animate-pulse"
              />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No posts yet. Check back soon.
          </p>
        ) : (
          <div className="max-w-4xl mx-auto grid gap-4">
            {posts.map((post) => (
              <button
                key={post.slug}
                onClick={() => handlePostClick(post.slug, post.filePath)}
                className="group text-left rounded-2xl glass p-6 hover-lift relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-primary/10 text-primary p-3 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground mb-3">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                      {post.summary}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="font-mono text-[11px] bg-secondary/60"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PostsSection;
