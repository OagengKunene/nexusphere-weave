import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { RightRail } from "@/components/layout/RightRail";
import { PostCard } from "@/components/feed/PostCard";
import { feed } from "@/lib/mock-data";

export const Route = createFileRoute("/saved")({
  component: Saved,
});

function Saved() {
  const items = feed.slice(0, 3);
  return (
    <AppShell right={<RightRail />}>
      <h1 className="font-display text-3xl mb-1">Saved</h1>
      <p className="text-muted-foreground mb-6">Posts, articles, and projects you bookmarked.</p>
      <div className="space-y-4">
        {items.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </AppShell>
  );
}
