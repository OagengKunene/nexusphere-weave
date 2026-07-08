import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { RightRail } from "@/components/layout/RightRail";
import { Composer } from "@/components/feed/Composer";
import { LivePostCard } from "@/components/feed/LivePostCard";
import { fetchPosts } from "@/lib/api";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "NexSphere — Intent-ranked social feed" },
      {
        name: "description",
        content:
          "The NexSphere feed ranks live conversation, professional posts, and community updates by what you're trying to do right now.",
      },
      { property: "og:title", content: "NexSphere — Intent-ranked social feed" },
      {
        property: "og:description",
        content:
          "Live conversation, careers, and communities in one intent-ranked feed.",
      },
      { property: "og:url", content: "https://nexusphere-weave.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://nexusphere-weave.lovable.app/" }],
  }),
});

const lanes = ["For you", "Professional", "Communities", "Trending", "Friends"] as const;

function Home() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  return (
    <AppShell right={<RightRail />}>
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="font-display text-3xl">Feed</h1>
        <span className="text-xs text-muted-foreground">
          Intent-ranked · <span className="text-signal">live</span>
        </span>
      </div>

      <div className="flex items-center gap-1 mb-4 rule-bottom pb-2 overflow-x-auto">
        {lanes.map((l, i) => (
          <button
            key={l}
            className={
              "px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition " +
              (i === 0
                ? "bg-card text-foreground border border-border"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {l}
          </button>
        ))}
      </div>

      <Composer />

      <div className="mt-4 space-y-4">
        {isLoading && (
          <div className="text-center text-sm text-muted-foreground py-8">Loading feed…</div>
        )}
        {!isLoading && posts && posts.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <h3 className="font-display text-xl mb-1">The feed is quiet.</h3>
            <p className="text-muted-foreground text-sm">
              Be the first to post — sign in and share what you're working on.
            </p>
          </div>
        )}
        {posts?.map((p) => (
          <LivePostCard key={p.id} post={p} />
        ))}
      </div>
    </AppShell>
  );
}
