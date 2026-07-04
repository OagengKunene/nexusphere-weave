import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { RightRail } from "@/components/layout/RightRail";
import { jobs } from "@/lib/mock-data";
import { MapPin, Building2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/jobs")({
  component: Jobs,
});

function Jobs() {
  return (
    <AppShell right={<RightRail />}>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Jobs</h1>
          <p className="text-muted-foreground">Matched to your profile, weighted by real skills.</p>
        </div>
        <span className="chip">
          <Sparkles className="h-3 w-3" /> AI-matched
        </span>
      </div>

      <div className="space-y-3">
        {jobs.map((j) => (
          <article
            key={j.role + j.company}
            className="bg-card border border-border rounded-lg p-5 hover:border-muted-foreground/40 transition"
          >
            <div className="flex items-start gap-4">
              <div
                className="h-12 w-12 rounded-md shrink-0 grid place-items-center font-display text-lg"
                style={{ background: "oklch(0.28 0.02 70)", color: "var(--signal)" }}
              >
                {j.company[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-lg">{j.role}</h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-3 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" /> {j.company}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {j.location}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-signal font-medium tabular-nums">{j.match}% match</div>
                    <div className="text-xs text-muted-foreground">{j.posted} ago</div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {j.skills.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {j.salary} · {j.type}
                  </span>
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-accent transition">
                      Save
                    </button>
                    <button className="text-xs px-3 py-1.5 rounded-md bg-signal text-signal-foreground font-medium hover:brightness-95 transition">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
