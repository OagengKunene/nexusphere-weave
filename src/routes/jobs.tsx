import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RightRail } from "@/components/layout/RightRail";
import { fetchJobs, fetchMyJobSaves, timeAgo } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Building2, Sparkles, Bookmark, X } from "lucide-react";

export const Route = createFileRoute("/jobs")({
  component: Jobs,
  head: () => ({
    meta: [
      { title: "Jobs on NexSphere — Roles, skills & apply links" },
      {
        name: "description",
        content:
          "Browse open roles from the NexSphere community. Save jobs, follow skills, and apply directly from your professional feed.",
      },
      { property: "og:title", content: "Jobs on NexSphere" },
      {
        property: "og:description",
        content: "Browse and apply to open roles shared by the NexSphere community.",
      },
      { property: "og:url", content: "https://nexusphere-weave.lovable.app/jobs" },
    ],
    links: [{ rel: "canonical", href: "https://nexusphere-weave.lovable.app/jobs" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Jobs on NexSphere",
          url: "https://nexusphere-weave.lovable.app/jobs",
          description: "Open roles posted by the NexSphere community.",
        }),
      },
    ],
  }),
});

function safeHttpUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

function Jobs() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [posting, setPosting] = useState(false);

  const { data: jobs, isLoading } = useQuery({ queryKey: ["jobs"], queryFn: fetchJobs });
  const { data: saved } = useQuery({
    queryKey: ["job-saves", user?.id],
    queryFn: () => (user ? fetchMyJobSaves(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const toggleSave = useMutation({
    mutationFn: async (jobId: string) => {
      if (!user) throw new Error("Sign in to save");
      const isSaved = saved?.includes(jobId);
      if (isSaved) {
        const { error } = await supabase
          .from("job_saves")
          .delete()
          .eq("job_id", jobId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("job_saves")
          .insert({ job_id: jobId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job-saves", user?.id] }),
  });

  return (
    <AppShell right={<RightRail />}>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Jobs</h1>
          <p className="text-muted-foreground">Roles posted by the community, ranked by recency.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip">
            <Sparkles className="h-3 w-3" /> {jobs?.length ?? 0} open
          </span>
          {user && (
            <button
              onClick={() => setPosting(true)}
              className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent transition"
            >
              Post a job
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="text-center text-sm text-muted-foreground py-8">Loading jobs…</div>
      )}

      <div className="space-y-3">
        {jobs?.map((j) => {
          const isSaved = saved?.includes(j.id);
          return (
            <article
              key={j.id}
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
                      <div className="text-sm text-muted-foreground flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" /> {j.company}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {j.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 text-xs text-muted-foreground">
                      {timeAgo(j.created_at)} ago
                    </div>
                  </div>

                  {j.description && (
                    <p className="text-sm text-foreground/80 mt-3 leading-relaxed">{j.description}</p>
                  )}

                  {j.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {j.skills.map((s) => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded bg-accent text-accent-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {j.salary ?? "Salary undisclosed"} · {j.employment_type}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleSave.mutate(j.id)}
                        disabled={!user || toggleSave.isPending}
                        className={
                          "text-xs px-3 py-1.5 rounded-md border transition inline-flex items-center gap-1 " +
                          (isSaved
                            ? "border-signal text-signal"
                            : "border-border hover:bg-accent")
                        }
                      >
                        <Bookmark className="h-3.5 w-3.5" fill={isSaved ? "currentColor" : "none"} />
                        {isSaved ? "Saved" : "Save"}
                      </button>
                      {(() => {
                        const safe = safeHttpUrl(j.apply_url);
                        return (
                          <a
                            href={safe ?? "#"}
                            target={safe ? "_blank" : undefined}
                            rel="noreferrer noopener"
                            aria-disabled={!safe}
                            onClick={(e) => {
                              if (!safe) e.preventDefault();
                            }}
                            className={
                              "text-xs px-3 py-1.5 rounded-md bg-signal text-signal-foreground font-medium hover:brightness-95 transition " +
                              (safe ? "" : "opacity-50 cursor-not-allowed")
                            }
                          >
                            Apply
                          </a>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        {!isLoading && jobs && jobs.length === 0 && (
          <EmptyState label="No jobs posted yet." />
        )}
      </div>

      {posting && user && (
        <PostJobModal
          onClose={() => setPosting(false)}
          onCreated={() => {
            setPosting(false);
            qc.invalidateQueries({ queryKey: ["jobs"] });
          }}
          userId={user.id}
        />
      )}
    </AppShell>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function PostJobModal({
  onClose,
  onCreated,
  userId,
}: {
  onClose: () => void;
  onCreated: () => void;
  userId: string;
}) {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: async () => {
      if (!role.trim() || !company.trim() || !location.trim()) {
        throw new Error("Role, company, and location are required.");
      }
      const trimmedUrl = applyUrl.trim();
      if (trimmedUrl && !safeHttpUrl(trimmedUrl)) {
        throw new Error("Apply URL must start with http:// or https://");
      }
      const { error } = await supabase.from("jobs").insert({
        posted_by: userId,
        role: role.trim(),
        company: company.trim(),
        location: location.trim(),
        salary: salary.trim() || null,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        description: description.trim() || null,
        apply_url: applyUrl.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: onCreated,
    onError: (e) => setErr(e instanceof Error ? e.message : String(e)),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-lg p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl">Post a job</h2>
          <button onClick={onClose} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <Field label="Role" value={role} onChange={setRole} placeholder="Senior Frontend Engineer" />
          <Field label="Company" value={company} onChange={setCompany} placeholder="Vercel" />
          <Field label="Location" value={location} onChange={setLocation} placeholder="Remote · EU" />
          <Field label="Salary" value={salary} onChange={setSalary} placeholder="$180–220K (optional)" />
          <Field label="Skills (comma-separated)" value={skills} onChange={setSkills} placeholder="React, TypeScript" />
          <Field label="Apply URL" value={applyUrl} onChange={setApplyUrl} placeholder="https://…" />
          <div>
            <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-muted-foreground"
            />
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
              {submit.isPending ? "Posting…" : "Post job"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
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
