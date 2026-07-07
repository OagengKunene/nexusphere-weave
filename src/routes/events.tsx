import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { RightRail } from "@/components/layout/RightRail";
import { fetchEvents, whenLabel, type DbEvent } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Video, MapPin, X } from "lucide-react";

export const Route = createFileRoute("/events")({
  component: Events,
});

function Events() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [hosting, setHosting] = useState(false);

  const { data: events, isLoading } = useQuery({ queryKey: ["events"], queryFn: fetchEvents });

  const toggleRsvp = useMutation({
    mutationFn: async (e: DbEvent) => {
      if (!user) throw new Error("Sign in to RSVP");
      const going = e.event_rsvps.some((r) => r.user_id === user.id);
      if (going) {
        const { error } = await supabase
          .from("event_rsvps")
          .delete()
          .eq("event_id", e.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("event_rsvps").insert({ event_id: e.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });

  return (
    <AppShell right={<RightRail />}>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Events</h1>
          <p className="text-muted-foreground">Meetups, webinars, and dinners you might join.</p>
        </div>
        {user && (
          <button
            onClick={() => setHosting(true)}
            className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-accent transition"
          >
            Host event
          </button>
        )}
      </div>

      {isLoading && (
        <div className="text-center text-sm text-muted-foreground py-8">Loading events…</div>
      )}

      <div className="space-y-3">
        {events?.map((e) => {
          const going = !!user && e.event_rsvps.some((r) => r.user_id === user.id);
          return (
            <article
              key={e.id}
              className="bg-card border border-border rounded-lg p-5 flex items-start gap-4"
            >
              <div className="h-14 w-14 rounded-md bg-accent grid place-items-center shrink-0">
                <Calendar className="h-5 w-5 text-signal" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {whenLabel(e.when_at)}
                </div>
                <h3 className="font-display text-xl leading-tight">{e.title}</h3>
                {e.description && (
                  <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{e.description}</p>
                )}
                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                  {e.host_name && <span>Hosted by {e.host_name}</span>}
                  <span className="inline-flex items-center gap-1">
                    {e.online ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                    {e.online ? "Online" : e.location ?? "In person"}
                  </span>
                  <span>· {e.event_rsvps.length} going</span>
                </div>
              </div>
              <button
                onClick={() => toggleRsvp.mutate(e)}
                disabled={!user || toggleRsvp.isPending}
                className={
                  "text-xs px-3 py-1.5 rounded-md font-medium shrink-0 " +
                  (going
                    ? "border border-signal text-signal"
                    : "bg-signal text-signal-foreground hover:brightness-95")
                }
              >
                {going ? "Going" : "RSVP"}
              </button>
            </article>
          );
        })}
        {!isLoading && events && events.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
            No upcoming events.
          </div>
        )}
      </div>

      {hosting && user && (
        <HostEventModal
          userId={user.id}
          onClose={() => setHosting(false)}
          onCreated={() => {
            setHosting(false);
            qc.invalidateQueries({ queryKey: ["events"] });
          }}
        />
      )}
    </AppShell>
  );
}

function HostEventModal({
  onClose,
  onCreated,
  userId,
}: {
  onClose: () => void;
  onCreated: () => void;
  userId: string;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [whenLocal, setWhenLocal] = useState("");
  const [online, setOnline] = useState(true);
  const [location, setLocation] = useState("");
  const [hostName, setHostName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: async () => {
      if (!title.trim() || !whenLocal) throw new Error("Title and date/time are required");
      const iso = new Date(whenLocal).toISOString();
      const { error } = await supabase.from("events").insert({
        host_id: userId,
        title: title.trim(),
        description: description.trim() || null,
        when_at: iso,
        online,
        location: online ? null : location.trim() || null,
        host_name: hostName.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: onCreated,
    onError: (e) => setErr(e instanceof Error ? e.message : String(e)),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl">Host an event</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <TextField label="Title" value={title} onChange={setTitle} placeholder="Portfolio Review Night" />
          <div>
            <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">When</label>
            <input
              type="datetime-local"
              value={whenLocal}
              onChange={(e) => setWhenLocal(e.target.value)}
              className="mt-1 w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-muted-foreground"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Format</label>
            <div className="mt-1 flex gap-2">
              <button
                onClick={() => setOnline(true)}
                className={
                  "text-xs px-3 py-1.5 rounded-md border " +
                  (online ? "border-signal text-signal" : "border-border")
                }
              >
                Online
              </button>
              <button
                onClick={() => setOnline(false)}
                className={
                  "text-xs px-3 py-1.5 rounded-md border " +
                  (!online ? "border-signal text-signal" : "border-border")
                }
              >
                In person
              </button>
            </div>
          </div>
          {!online && (
            <TextField label="Location" value={location} onChange={setLocation} placeholder="Cape Town, ZA" />
          )}
          <TextField label="Host name" value={hostName} onChange={setHostName} placeholder="Design Buddies" />
          <div>
            <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Description</label>
            <textarea
              rows={3}
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
              {submit.isPending ? "Publishing…" : "Publish"}
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
