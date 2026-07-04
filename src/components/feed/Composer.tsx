import { Image, FileText, Briefcase, BarChart3, Calendar } from "lucide-react";
import { Avatar } from "../layout/Avatar";

export function Composer() {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex gap-3">
        <Avatar name="Sade Adeyemi" hue={60} size={40} />
        <div className="flex-1">
          <textarea
            rows={2}
            placeholder="Share an update, an article, or a project…"
            className="w-full bg-transparent resize-none text-[0.98rem] placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-muted-foreground">
              <ComposerBtn icon={Image} label="Media" />
              <ComposerBtn icon={FileText} label="Article" />
              <ComposerBtn icon={Briefcase} label="Project" />
              <ComposerBtn icon={BarChart3} label="Poll" />
              <ComposerBtn icon={Calendar} label="Event" />
            </div>
            <button className="bg-signal text-signal-foreground text-sm font-medium rounded-md px-4 py-1.5 hover:brightness-95 transition">
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComposerBtn({ icon: Icon, label }: { icon: typeof Image; label: string }) {
  return (
    <button
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-accent hover:text-foreground transition text-xs"
      aria-label={label}
    >
      <Icon className="h-4 w-4" strokeWidth={1.6} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
