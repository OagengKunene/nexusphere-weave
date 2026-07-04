import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { RightRail } from "@/components/layout/RightRail";
import { notifications } from "@/lib/mock-data";
import { UserPlus, Heart, Briefcase, AtSign, Calendar, Users } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  component: Notifications,
});

const iconMap = {
  follow: UserPlus,
  like: Heart,
  job: Briefcase,
  mention: AtSign,
  event: Calendar,
  group: Users,
} as const;

function Notifications() {
  return (
    <AppShell right={<RightRail />}>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-display text-3xl">Notifications</h1>
        <button className="text-sm text-muted-foreground hover:text-foreground">Mark all read</button>
      </div>

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {notifications.map((n, i) => {
          const Icon = iconMap[n.kind as keyof typeof iconMap];
          return (
            <div key={i} className="p-4 flex items-start gap-3 hover:bg-accent/40 transition">
              <div className="h-9 w-9 rounded-full bg-accent grid place-items-center text-signal shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm">{n.text}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{n.time} ago</div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
