import { TrendingUp, UserPlus, Users, Calendar, Briefcase } from "lucide-react";
import { trends, suggestedPeople, suggestedGroups, upcomingEvents, jobMatches } from "@/lib/mock-data";

export function RightRail() {
  return (
    <>
      <RailCard title="Trending now" icon={TrendingUp}>
        <ul className="divide-y divide-border">
          {trends.map((t) => (
            <li key={t.tag} className="py-2.5">
              <div className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">{t.lane}</div>
              <div className="font-medium">{t.tag}</div>
              <div className="text-xs text-muted-foreground">{t.posts} posts</div>
            </li>
          ))}
        </ul>
      </RailCard>

      <RailCard title="People to know" icon={UserPlus}>
        <ul className="space-y-3">
          {suggestedPeople.map((p) => (
            <li key={p.handle} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">{p.role}</div>
                <div className="text-[0.68rem] text-muted-foreground">{p.mutual} mutual</div>
              </div>
              <button className="text-xs px-3 py-1 rounded-full border border-border hover:bg-accent transition">
                Follow
              </button>
            </li>
          ))}
        </ul>
      </RailCard>

      <RailCard title="Groups for you" icon={Users}>
        <ul className="space-y-3">
          {suggestedGroups.map((g) => (
            <li key={g.name}>
              <div className="font-medium">{g.name}</div>
              <div className="text-xs text-muted-foreground">{g.members} · {g.topic}</div>
            </li>
          ))}
        </ul>
      </RailCard>

      <RailCard title="Upcoming events" icon={Calendar}>
        <ul className="space-y-3">
          {upcomingEvents.map((e) => (
            <li key={e.title}>
              <div className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                {e.when} {e.online ? "· Online" : "· In person"}
              </div>
              <div className="font-medium">{e.title}</div>
              <div className="text-xs text-muted-foreground">Hosted by {e.host}</div>
            </li>
          ))}
        </ul>
      </RailCard>

      <RailCard title="Job matches" icon={Briefcase}>
        <ul className="space-y-3">
          {jobMatches.map((j) => (
            <li key={j.role}>
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium truncate">{j.role}</div>
                <span className="text-[0.68rem] text-signal font-medium">{j.match}%</span>
              </div>
              <div className="text-xs text-muted-foreground">{j.company} · {j.location}</div>
              <div className="text-xs text-muted-foreground">{j.salary}</div>
            </li>
          ))}
        </ul>
      </RailCard>

      <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
        NexSphere is a hybrid social network — professional identity, communities, and public conversation, ranked by intent.
      </p>
    </>
  );
}

function RailCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof TrendingUp;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card border border-border rounded-lg p-4">
      <h3 className="flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground mb-3">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h3>
      {children}
    </section>
  );
}
