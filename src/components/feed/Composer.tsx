import { Image, FileText, Briefcase, BarChart3, Calendar } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar } from "../layout/Avatar";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function Composer() {
  const { user, profile } = useAuth();
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const mut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to post");
      const content = text.trim();
      if (!content) throw new Error("Say something first");
      const { error } = await supabase
        .from("posts")
        .insert({ author_id: user.id, content, kind: "quick", lane: "Professional" });
      if (error) throw error;
    },
    onSuccess: () => {
      setText("");
      setErr(null);
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (e) => setErr(e instanceof Error ? e.message : String(e)),
  });

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-lg p-5 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Sign in to share updates, articles, and projects.
        </p>
        <Link
          to="/auth"
          className="text-sm px-4 py-1.5 rounded-md bg-signal text-signal-foreground font-medium hover:brightness-95"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex gap-3">
        <Avatar name={profile?.name ?? "You"} hue={profile?.avatar_hue ?? 60} size={40} />
        <div className="flex-1">
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share an update, an article, or a project…"
            className="w-full bg-transparent resize-none text-[0.98rem] placeholder:text-muted-foreground focus:outline-none"
          />
          {err && <div className="text-xs text-heat mt-1">{err}</div>}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-muted-foreground">
              <ComposerBtn icon={Image} label="Media" />
              <ComposerBtn icon={FileText} label="Article" />
              <ComposerBtn icon={Briefcase} label="Project" />
              <ComposerBtn icon={BarChart3} label="Poll" />
              <ComposerBtn icon={Calendar} label="Event" />
            </div>
            <button
              onClick={() => mut.mutate()}
              disabled={mut.isPending || !text.trim()}
              className="bg-signal text-signal-foreground text-sm font-medium rounded-md px-4 py-1.5 hover:brightness-95 transition disabled:opacity-60"
            >
              {mut.isPending ? "Posting…" : "Post"}
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
