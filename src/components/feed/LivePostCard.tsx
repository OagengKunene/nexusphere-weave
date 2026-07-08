import { MessageCircle, Repeat2, Heart, Bookmark, Share2, BadgeCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DbPost } from "@/lib/api";
import { timeAgo } from "@/lib/api";
import { Avatar } from "../layout/Avatar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const laneColor: Record<DbPost["lane"], string> = {
  Professional: "var(--signal)",
  Community: "var(--heat)",
  Trending: "oklch(0.75 0.15 260)",
  Friends: "oklch(0.78 0.14 320)",
};

export function LivePostCard({ post }: { post: DbPost }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const liked = !!user && post.likes.some((l) => l.user_id === user.id);

  const like = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to like posts");
      if (liked) {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("likes")
          .insert({ post_id: post.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });

  const author = post.profiles;
  return (
    <article className="bg-card border border-border rounded-lg p-5 hover:border-muted-foreground/30 transition-colors">
      <header className="flex items-start gap-3">
        <Avatar name={author?.name ?? "?"} hue={author?.avatar_hue ?? 60} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-foreground truncate">
              {author?.name ?? "Unknown"}
            </span>
            <BadgeCheck className="h-4 w-4 text-signal shrink-0 opacity-60" />
            <span className="text-muted-foreground text-sm">@{author?.handle ?? "?"}</span>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">{timeAgo(post.created_at)}</span>
          </div>
          {author?.headline && (
            <div className="text-sm text-muted-foreground truncate">{author.headline}</div>
          )}
        </div>
        <span
          className="text-[0.62rem] uppercase tracking-[0.14em] px-2 py-1 rounded-full border shrink-0"
          style={{ borderColor: laneColor[post.lane], color: laneColor[post.lane] }}
        >
          {post.lane}
        </span>
      </header>

      <div className="mt-4">
        {post.title && <h2 className="font-display text-2xl leading-tight mb-2">{post.title}</h2>}
        <p className="text-foreground/95 text-[1.02rem] leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <span key={t} className="text-xs text-signal">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-4 pt-3 rule-top flex items-center justify-between text-muted-foreground text-sm">
        <button
          aria-label="Comment on post"
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded hover:text-foreground hover:bg-accent/60"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
        <button
          aria-label="Repost"
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded hover:text-foreground hover:bg-accent/60"
        >
          <Repeat2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => like.mutate()}
          disabled={!user || like.isPending}
          aria-label={liked ? "Unlike post" : "Like post"}
          aria-pressed={liked}
          className={
            "inline-flex items-center gap-1.5 px-2 py-1 rounded hover:bg-accent/60 transition " +
            (liked ? "text-heat" : "hover:text-foreground")
          }
        >
          <Heart className="h-4 w-4" fill={liked ? "currentColor" : "none"} />
          <span className="text-xs tabular-nums">{post.likes.length}</span>
        </button>
        <button
          aria-label="Bookmark post"
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded hover:text-foreground hover:bg-accent/60"
        >
          <Bookmark className="h-4 w-4" />
        </button>
        <button
          aria-label="Share post"
          className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs hover:text-foreground hover:bg-accent/60"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </footer>
    </article>
  );
}
