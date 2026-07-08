import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RightRail } from "@/components/layout/RightRail";
import { fetchCommunities, type DbCommunity } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Globe, X } from "lucide-react";

export const Route = createFileRoute("/communities")({
  component: Communities,
  head: () => ({
    meta: [
      { title: "Communities on NexSphere — Join groups & rooms" },
      {
        name: "description",
        content:
          "Discover public and private communities on NexSphere. Join groups for design, engineering, careers, and more.",
      },
      { property: "og:title", content: "Communities on NexSphere" },
      {
        property: "og:description",
        content: "Public and private communities to join on NexSphere.",
      },
      { property: "og:url", content: "https://nexusphere-weave.lovable.app/communities" },
    ],
    links: [{ rel: "canonical", href: "https://nexusphere-weave.lovable.app/communities" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Communities on NexSphere",
          url: "https://nexusphere-weave.lovable.app/communities",
        }),
      },
    ],
  }),
});

function Communities() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);

  const { data: communities, isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  const toggleJoin = useMutation({
    mutationFn: async (c: DbCommunity) => {
      if (!user) throw new Error("Sign in to join");
      const joined = c.community_members.some((m) => m.user_id === user.id);
      if (joined) {
        const { error } = await supabase
          .from("community_members")
          .delete()
          .eq("community_id", c.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("community_members")
          .insert({ community_id: c.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["communities"] }),
  });

  return (
    <AppShell right={<RightRail />}>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Communities</h1>
          <p className="text-muted-foreground">Groups you're part of, and rooms worth joining.</p>
        </div>
        {user && (
          <button
            onClick={() => setCreating(true)}
            className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent transition"
          >
            New group
          </button>
        )}
      </div>

      {isLoading && (
        <div className="text-center text-sm text-muted-foreground py-8">Loading communities…</div>
      )}

      <div className="grid md:grid-cols-2 gap-3">
        {communities?.map((c) => {
          const memberCount = c.community_members.length;
          const joined = !!user && c.community_members.some((m) => m.user_id === user.id);
          return (
            <div
              key={c.id}
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
                    {c.privacy === "private" ? (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  {c.topic && <div className="text-xs text-muted-foreground">{c.topic}</div>}
                  <div className="text-xs text-muted-foreground mt-1">
                    {memberCount} member{memberCount === 1 ? "" : "s"}
                  </div>
                </div>
                <button
                  onClick={() => toggleJoin.mutate(c)}
                  disabled={!user || toggleJoin.isPending}
                  className={
                    "text-xs px-3 py-1 rounded-full font-medium shrink-0 " +
                    (joined
                      ? "border border-signal text-signal"
                      : "bg-signal text-signal-foreground hover:brightness-95")
                  }
                >
                  {joined ? "Joined" : "Join"}
                </button>
              </div>
            </div>
          );
        })}
        {!isLoading && communities && communities.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground md:col-span-2">
            No communities yet.
          </div>
        )}
      </div>

      {creating && user && (
        <NewCommunityModal
          userId={user.id}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            qc.invalidateQueries({ queryKey: ["communities"] });
          }}
        />
      )}
    </AppShell>
  );
}

function NewCommunityModal({
  onClose,
  onCreated,
  userId,
}: {
  onClose: () => void;
  onCreated: () => void;
  userId: string;
}) {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [err, setErr] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Name is required");
      const slug =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        Math.random().toString(36).slice(2, 6);
      const { data, error } = await supabase
        .from("communities")
        .insert({
          slug,
          name: name.trim(),
          topic: topic.trim() || null,
          description: description.trim() || null,
          privacy,
          created_by: userId,
        })
        .select("id")
        .single();
      if (error) throw error;
      const { error: e2 } = await supabase
        .from("community_members")
        .insert({ community_id: data.id, user_id: userId, role: "owner" });
      if (e2) throw e2;
    },
    onSuccess: onCreated,
    onError: (e) => setErr(e instanceof Error ? e.message : String(e)),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl">New community</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <TextField label="Name" value={name} onChange={setName} placeholder="Design Engineering" />
          <TextField label="Topic" value={topic} onChange={setTopic} placeholder="Craft · tokens · motion" />
          <div>
            <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-muted-foreground"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Privacy</label>
            <div className="mt-1 flex gap-2">
              {(["public", "private"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPrivacy(p)}
                  className={
                    "text-xs px-3 py-1.5 rounded-md border capitalize " +
                    (privacy === p ? "border-signal text-signal" : "border-border")
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {err && <div className="text-xs text-heat">{err}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="text-sm px-4 py-1.5 rounded-md border border-border hover:bg-accent">
              Cancel
            </button>
            <button
              onClick={() => submit.mutate()}
              disabled={submit.isPending}
              className="text-sm px-4 py-1.5 rounded-md bg-signal text-signal-foreground font-medium hover:brightness-95 disabled:opacity-60"
            >
              {submit.isPending ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-muted-foreground"
      />
    </div>
  );
}
