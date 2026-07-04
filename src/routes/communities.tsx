import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { RightRail } from "@/components/layout/RightRail";
import { communities } from "@/lib/mock-data";
import { Lock, Globe } from "lucide-react";

export const Route = createFileRoute("/communities")({
  component: Communities,
});

function Communities() {
  return (
    <AppShell right={<RightRail />}>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Communities</h1>
          <p className="text-muted-foreground">Groups you're part of, and rooms worth joining.</p>
        </div>
        <button className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent transition">
          New group
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {communities.map((c) => (
          <div
            key={c.name}
            className="bg-card border border-border rounded-lg p-4 hover:border-muted-foreground/40 transition"
          >
            <div className="flex items-start gap-3">
              <div
                className="h-11 w-11 rounded-md shrink-0"
                style={{
                  background: `linear-gradient(135deg, oklch(0.35 0.1 ${c.name.length * 30}), oklch(0.45 0.12 ${c.name.length * 30 + 60}))`,
                }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{c.name}</h3>
                  {c.privacy === "Private" ? (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{c.topic}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {c.members} members · {c.posts}
                </div>
              </div>
              <button className="text-xs px-3 py-1 rounded-full bg-signal text-signal-foreground font-medium">
                Join
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
