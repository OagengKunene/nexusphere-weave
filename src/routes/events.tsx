import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { RightRail } from "@/components/layout/RightRail";
import { upcomingEvents } from "@/lib/mock-data";
import { Calendar, Video, MapPin } from "lucide-react";

export const Route = createFileRoute("/events")({
  component: Events,
});

function Events() {
  return (
    <AppShell right={<RightRail />}>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Events</h1>
          <p className="text-muted-foreground">Meetups, webinars, and dinners you might join.</p>
        </div>
        <button className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent transition">
          Host event
        </button>
      </div>

      <div className="space-y-3">
        {upcomingEvents.map((e) => (
          <article
            key={e.title}
            className="bg-card border border-border rounded-lg p-5 flex items-start gap-4"
          >
            <div className="h-14 w-14 rounded-md bg-accent grid place-items-center shrink-0">
              <Calendar className="h-5 w-5 text-signal" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                {e.when}
              </div>
              <h3 className="font-display text-xl leading-tight">{e.title}</h3>
              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                <span>Hosted by {e.host}</span>
                <span className="inline-flex items-center gap-1">
                  {e.online ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                  {e.online ? "Online" : "In person"}
                </span>
              </div>
            </div>
            <button className="text-xs px-3 py-1.5 rounded-md bg-signal text-signal-foreground font-medium">
              RSVP
            </button>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
