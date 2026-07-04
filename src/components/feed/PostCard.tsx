import { MessageCircle, Repeat2, Heart, Bookmark, Share2, BadgeCheck, BookOpen, Github, ExternalLink } from "lucide-react";
import type { FeedPost } from "@/lib/mock-data";
import { Avatar } from "../layout/Avatar";

const laneColor: Record<FeedPost["lane"], string> = {
  Professional: "var(--signal)",
  Community: "var(--heat)",
  Trending: "oklch(0.75 0.15 260)",
  Friends: "oklch(0.78 0.14 320)",
};

export function PostCard({ post }: { post: FeedPost }) {
  return (
    <article className="bg-card border border-border rounded-lg p-5 hover:border-muted-foreground/30 transition-colors">
      <header className="flex items-start gap-3">
        <Avatar name={post.author.name} hue={post.author.avatarHue} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-foreground truncate">{post.author.name}</span>
            {post.author.verified && (
              <BadgeCheck className="h-4 w-4 text-signal shrink-0" />
            )}
            <span className="text-muted-foreground text-sm">@{post.author.handle}</span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">{post.time}</span>
          </div>
          <div className="text-sm text-muted-foreground truncate">{post.author.role}</div>
        </div>
        <span
          className="text-[0.62rem] uppercase tracking-[0.14em] px-2 py-1 rounded-full border shrink-0"
          style={{ borderColor: laneColor[post.lane], color: laneColor[post.lane] }}
        >
          {post.lane}
        </span>
      </header>

      <div className="mt-4">
        {post.kind === "article" && (
          <>
            <h2 className="font-display text-2xl leading-tight mb-2">{post.title}</h2>
            <p className="text-foreground/90 text-[0.98rem] leading-relaxed">{post.content}</p>
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> {post.readMinutes} min read
              </span>
              <button className="text-signal hover:underline">Read article →</button>
            </div>
          </>
        )}

        {post.kind === "portfolio" && (
          <>
            <div className="chip mb-3" style={{ color: "var(--heat)", borderColor: "var(--heat)" }}>
              Portfolio project
            </div>
            <h2 className="font-display text-2xl leading-tight mb-2">{post.title}</h2>
            <p className="text-foreground/90 text-[0.98rem] leading-relaxed">{post.content}</p>
            {post.tech && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.tech.map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <button className="inline-flex items-center gap-1.5 hover:text-foreground">
                <Github className="h-4 w-4" /> GitHub
              </button>
              <button className="inline-flex items-center gap-1.5 hover:text-foreground">
                <ExternalLink className="h-4 w-4" /> Live site
              </button>
            </div>
          </>
        )}

        {post.kind === "quick" && (
          <p className="text-foreground/95 text-[1.02rem] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {post.tags && post.kind === "quick" && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <span key={t} className="text-xs text-signal">#{t}</span>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-4 pt-3 rule-top flex items-center justify-between text-muted-foreground text-sm">
        <Action icon={MessageCircle} value={post.stats.replies} />
        <Action icon={Repeat2} value={post.stats.reposts} />
        <Action icon={Heart} value={post.stats.likes} />
        <Action icon={Bookmark} />
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          <Share2 className="h-4 w-4" /> {post.stats.views} views
        </div>
      </footer>
    </article>
  );
}

function Action({ icon: Icon, value }: { icon: typeof Heart; value?: number }) {
  return (
    <button className="inline-flex items-center gap-1.5 px-2 py-1 rounded hover:text-foreground hover:bg-accent/60 transition">
      <Icon className="h-4 w-4" strokeWidth={1.6} />
      {typeof value === "number" && <span className="text-xs tabular-nums">{formatNum(value)}</span>}
    </button>
  );
}

function formatNum(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
