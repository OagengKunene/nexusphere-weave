import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { RightRail } from "@/components/layout/RightRail";
import { trends } from "@/lib/mock-data";
import { Flame, Newspaper, Code2, Trophy, Palette, Briefcase } from "lucide-react";

export const Route = createFileRoute("/explore")({
  component: Explore,
  head: () => ({
    meta: [
      { title: "Explore NexSphere — Trending topics & voices" },
      {
        name: "description",
        content:
          "Explore trending topics across technology, design, careers, sports, news, and culture on NexSphere.",
      },
      { property: "og:title", content: "Explore NexSphere" },
      {
        property: "og:description",
        content: "Trending topics and voices across NexSphere.",
      },
      { property: "og:url", content: "https://nexusphere-weave.lovable.app/explore" },
    ],
    links: [{ rel: "canonical", href: "https://nexusphere-weave.lovable.app/explore" }],
  }),
});

const topics = [
  { name: "Technology", icon: Code2, hue: 200, posts: "1.2M" },
  { name: "Design", icon: Palette, hue: 320, posts: "412K" },
  { name: "Careers", icon: Briefcase, hue: 60, posts: "890K" },
  { name: "Sports", icon: Trophy, hue: 20, posts: "2.1M" },
  { name: "News", icon: Newspaper, hue: 100, posts: "3.4M" },
  { name: "Culture", icon: Flame, hue: 350, posts: "612K" },
];

function Explore() {
  return (
    <AppShell right={<RightRail />}>
      <h1 className="font-display text-3xl mb-1">Explore</h1>
      <p className="text-muted-foreground mb-6">What the whole platform is talking about right now.</p>

      <section className="mb-8">
        <h2 className="text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground mb-3">Topics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {topics.map((t) => (
            <button
              key={t.name}
              className="bg-card border border-border rounded-lg p-4 text-left hover:border-muted-foreground/40 transition"
            >
              <div
                className="h-9 w-9 rounded-md grid place-items-center mb-3"
                style={{ background: `oklch(0.30 0.08 ${t.hue})`, color: `oklch(0.9 0.15 ${t.hue})` }}
              >
                <t.icon className="h-4 w-4" />
              </div>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.posts} posts today</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground mb-3">Trending tags</h2>
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {trends.map((t, i) => (
            <div key={t.tag} className="flex items-center gap-4 p-4">
              <span className="font-display text-2xl text-muted-foreground w-8 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <div className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">{t.lane}</div>
                <div className="font-medium">{t.tag}</div>
              </div>
              <span className="text-sm text-muted-foreground tabular-nums">{t.posts}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
