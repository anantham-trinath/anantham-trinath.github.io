import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface Post {
  title: string;
  summary: string;
  date: string;
  readTime: string;
  tags: string[];
  slug: string;
  mdContent: string;
}

const PostView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the specific post by slug
        const postPath = `/posts/${slug}.md`;
        const response = await fetch(postPath);

        if (!response.ok) {
          throw new Error("Post not found");
        }

        const content = await response.text();

        // Extract metadata from content
        const title = extractTitle(content, `${slug}.md`);
        const summary = extractSummary(content);
        const tags = extractTags(content);
        const date = extractDate(content);

        setPost({
          title,
          summary,
          date,
          readTime: calculateReadTime(content),
          tags,
          slug: slug!,
          mdContent: content,
        });
      } catch (error) {
        setError("Post not found or could not be loaded");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  // Helper functions (same as in PostsSection)
  const extractTitle = (content: string, filename: string): string => {
    const titleMatch =
      content.match(/^#\s+(.+)$/m) ||
      content.match(/title:\s*['"]?([^'"\n]+)['"]?/);
    return titleMatch
      ? titleMatch[1].trim()
      : filename.replace(".md", "").replace(/-/g, " ");
  };

  const extractSummary = (content: string): string => {
    const descriptionMatch = content.match(
      /\*\*Description:\*\*\s*([\s\S]*?)(?=\n\n|\n---|\n##|\n###|\n#)/i
    );
    if (descriptionMatch) {
      return descriptionMatch[1].trim();
    }

    const summaryMatch =
      content.match(/summary:\s*['"]?([^'"\n]+)['"]?/) ||
      content.match(/description:\s*['"]?([^'"\n]+)['"]?/);

    if (summaryMatch) return summaryMatch[1].trim();

    const lines = content.split("\n").filter((line) => line.trim());
    const firstParagraph = lines.find(
      (line) => !line.startsWith("#") && !line.includes(":") && line.length > 50
    );
    return firstParagraph
      ? firstParagraph.substring(0, 150) + "..."
      : "No summary available";
  };

  const extractTags = (content: string): string[] => {
    const tagsMatch = content.match(/\*\*Tags:\*\*\s*([^\n]+)/i);
    if (tagsMatch) {
      const tagsStr = tagsMatch[1];
      return tagsStr
        .split(",")
        .map((tag) => tag.trim().replace(/['"\[\]]/g, ""));
    }

    const fallbackMatch =
      content.match(/tags:\s*\[(.*?)\]/s) || content.match(/tags:\s*([^\n]+)/i);
    if (fallbackMatch) {
      const tagsStr = fallbackMatch[1];
      return tagsStr
        .split(",")
        .map((tag) => tag.trim().replace(/['"\[\]]/g, ""));
    }

    return ["Technical", "Blog"];
  };

  const extractDate = (content: string): string => {
    const dateMatch = content.match(/\*\*Published:\*\*\s*([^\n]+)/i);
    let postDate = new Date().toISOString().split("T")[0];

    if (dateMatch) {
      const extractedDate = dateMatch[1].trim();
      const parsedDate = new Date(extractedDate);
      if (!isNaN(parsedDate.getTime())) {
        postDate = parsedDate.toISOString().split("T")[0];
      }
    }

    return postDate;
  };

  const calculateReadTime = (content: string): string => {
    const wordCount = content.split(/\s+/).length;
    const readingSpeed = 200;
    const minutes = Math.ceil(wordCount / readingSpeed);
    return `${minutes} min read`;
  };

  // Custom components for ReactMarkdown
  const components = {
    h1: ({ children }: any) => (
      <h1 className="text-3xl font-bold mb-6 text-foreground">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-bold mb-4 mt-8 text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-bold mb-3 mt-6 text-foreground">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-lg font-bold mb-2 mt-4 text-foreground">
        {children}
      </h4>
    ),
    p: ({ children }: any) => (
      <p className="mb-4 text-foreground leading-relaxed">{children}</p>
    ),
    strong: ({ children }: any) => (
      <strong className="font-bold text-foreground">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-foreground">{children}</em>
    ),
    code: ({ children, className }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      return !match ? (
        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground">
          {children}
        </code>
      ) : (
        <code className={className}>{children}</code>
      );
    },
    pre: ({ children }: any) => (
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
        {children}
      </pre>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground">
        {children}
      </ol>
    ),
    li: ({ children }: any) => <li className="text-foreground">{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
        {children}
      </blockquote>
    ),
    a: ({ href, children }: any) => (
      <a
        href={href}
        className="text-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-border rounded-lg">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="border border-border px-4 py-2 bg-muted font-bold text-foreground">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border border-border px-4 py-2 text-foreground">
        {children}
      </td>
    ),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Post Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              {error || "The requested post could not be found."}
            </p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </Link>
          </Button>
        </div>
      </div>

      {/* Article */}
      <article className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-12">
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              {post.summary}
            </p>

            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none text-foreground leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={components}
            >
              {post.mdContent}
            </ReactMarkdown>
          </div>

          {/* Article Footer */}
          <footer className="mt-12 pt-8 border-t border-border/50">
            <div className="flex items-center justify-between">
              <Button variant="ghost" asChild>
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Posts
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <a
                  href={`https://github.com/trinathanantham/tech-edu-hub/blob/main/${post.slug}.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
};

export default PostView;
