import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { RightRail } from "@/components/layout/RightRail";
import { profile } from "@/lib/mock-data";
import { Avatar } from "@/components/layout/Avatar";
import { MapPin, Link as LinkIcon, BadgeCheck } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  component: Profile,
});

const tabs = ["Overview", "Professional", "Portfolio", "Social"] as const;

function Profile() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");

  return (
    <AppShell right={<RightRail />}>
      {/* Cover */}
      <div
        className="h-40 rounded-lg mb-[-40px]"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.30 0.08 60), oklch(0.25 0.10 20), oklch(0.28 0.12 120))",
        }}
        aria-hidden
      />

      <div className="bg-card border border-border rounded-lg p-6 relative">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="-mt-14">
            <div
              className="h-24 w-24 rounded-full grid place-items-center font-display text-4xl border-4 border-background"
              style={{ background: "oklch(0.32 0.08 60)", color: "oklch(0.96 0.06 60)" }}
            >
              SA
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-3xl">{profile.name}</h1>
              <BadgeCheck className="h-5 w-5 text-signal" />
              {profile.openToWork && (
                <span className="chip" style={{ color: "var(--signal)", borderColor: "var(--signal)" }}>
                  Open to work
                </span>
              )}
            </div>
            <div className="text-muted-foreground">@{profile.handle}</div>
            <p className="mt-2 max-w-2xl">{profile.headline}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {profile.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <LinkIcon className="h-3.5 w-3.5" /> {profile.website}
              </span>
              <span>
                <strong className="text-foreground tabular-nums">{profile.stats.followers}</strong> followers
              </span>
              <span>
                <strong className="text-foreground tabular-nums">{profile.stats.following}</strong> following
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="text-sm px-4 py-1.5 rounded-md border border-border hover:bg-accent">
              Message
            </button>
            <button className="text-sm px-4 py-1.5 rounded-md bg-signal text-signal-foreground font-medium hover:brightness-95">
              Follow
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-1 rule-top pt-3 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "px-3 py-1.5 text-sm rounded-md whitespace-nowrap transition " +
                (t === tab
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Card title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((s) => (
              <span key={s} className="text-xs px-2 py-1 rounded bg-accent">{s}</span>
            ))}
          </div>
        </Card>

        <Card title="Experience">
          <ul className="space-y-3">
            {profile.experience.map((e) => (
              <li key={e.role}>
                <div className="font-medium">{e.role} · <span className="text-muted-foreground">{e.company}</span></div>
                <div className="text-xs text-muted-foreground">{e.period}</div>
                <div className="text-sm mt-1 text-foreground/90">{e.detail}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Portfolio">
          <ul className="space-y-3">
            {profile.portfolio.map((p) => (
              <li key={p.title}>
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-muted-foreground">{p.tech.join(" · ")} · {p.year}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Education">
          {profile.education.map((e) => (
            <div key={e.school}>
              <div className="font-medium">{e.school}</div>
              <div className="text-sm text-muted-foreground">{e.degree}</div>
              <div className="text-xs text-muted-foreground">{e.period}</div>
            </div>
          ))}
        </Card>
      </div>
    </AppShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-border rounded-lg p-5">
      <h3 className="text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground mb-3">{title}</h3>
      {children}
    </section>
  );
}
