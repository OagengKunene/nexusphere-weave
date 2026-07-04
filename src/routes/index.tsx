import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { RightRail } from "@/components/layout/RightRail";
import { Composer } from "@/components/feed/Composer";
import { PostCard } from "@/components/feed/PostCard";
import { feed } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: Home,
});

const lanes = ["For you", "Professional", "Communities", "Trending", "Friends"] as const;

function Home() {
  return (
    <AppShell right={<RightRail />}>
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="font-display text-3xl">Feed</h1>
        <span className="text-xs text-muted-foreground">
          Intent-ranked · <span className="text-signal">weekday · pro-leaning</span>
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
        {feed.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
        <div className="text-center text-sm text-muted-foreground py-8">
          You're caught up. Come back after lunch — the ranker will shift.
        </div>
      </div>
    </AppShell>
  );
}
