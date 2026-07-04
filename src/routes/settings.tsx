import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

const sections = [
  { title: "Account", desc: "Email, password, connected accounts, MFA." },
  { title: "Privacy", desc: "Who can see your posts, who can message you, blocked accounts." },
  { title: "Feed intent", desc: "Tune how the ranker weighs professional, community, trending, and friends." },
  { title: "Notifications", desc: "In-app, email, and push channels per event type." },
  { title: "Career", desc: "Open to work, recruiter visibility, salary preferences." },
  { title: "Appearance", desc: "Theme, density, motion." },
];

function Settings() {
  return (
    <AppShell>
      <h1 className="font-display text-3xl mb-1">Settings</h1>
      <p className="text-muted-foreground mb-6">Control how NexSphere reads your intent and shows your identity.</p>

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {sections.map((s) => (
          <button key={s.title} className="w-full text-left p-5 hover:bg-accent/40 transition">
            <div className="font-medium">{s.title}</div>
            <div className="text-sm text-muted-foreground">{s.desc}</div>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
