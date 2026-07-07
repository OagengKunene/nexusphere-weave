import { TrendingUp, UserPlus, Users, Calendar, Briefcase } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { trends } from "@/lib/mock-data";
import {
  fetchSuggestedPeople,
  fetchMyFollowing,
  fetchCommunities,
  fetchEvents,
  fetchJobs,
  whenLabel,
} from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "./Avatar";

export function RightRail() {
  const { data: communities } = useQuery({ queryKey: ["communities"], queryFn: fetchCommunities });
  const { data: events } = useQuery({ queryKey: ["events"], queryFn: fetchEvents });
  const { data: jobs } = useQuery({ queryKey: ["jobs"], queryFn: fetchJobs });

  return (
    <>
      <RailCard title="Trending now" icon={TrendingUp}>
        <ul className="divide-y divide-border">
          {trends.map((t) => (
            <li key={t.tag} className="py-2.5">
              <div className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                {t.lane}
              </div>
              <div className="font-medium">{t.tag}</div>
              <div className="text-xs text-muted-foreground">{t.posts} posts</div>
            </li>
          ))}
        </ul>
      </RailCard>

      <PeopleToKnow />

      <RailCard title="Groups for you" icon={Users}>
        {communities && communities.length > 0 ? (
          <ul className="space-y-3">
            {communities.slice(0, 3).map((g) => (
              <li key={g.id}>
                <Link to="/communities" className="block hover:text-foreground">
                  <div className="font-medium">{g.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {g.community_members.length} member{g.community_members.length === 1 ? "" : "s"}
                    {g.topic ? ` · ${g.topic}` : ""}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No communities yet.</p>
        )}
      </RailCard>

      <RailCard title="Upcoming events" icon={Calendar}>
        {events && events.length > 0 ? (
          <ul className="space-y-3">
            {events.slice(0, 3).map((e) => (
              <li key={e.id}>
                <Link to="/events" className="block hover:text-foreground">
                  <div className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {whenLabel(e.when_at)} {e.online ? "· Online" : "· In person"}
                  </div>
                  <div className="font-medium">{e.title}</div>
                  {e.host_name && (
                    <div className="text-xs text-muted-foreground">Hosted by {e.host_name}</div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">Nothing on the calendar.</p>
        )}
      </RailCard>

      <RailCard title="Latest jobs" icon={Briefcase}>
        {jobs && jobs.length > 0 ? (
          <ul className="space-y-3">
            {jobs.slice(0, 3).map((j) => (
              <li key={j.id}>
                <Link to="/jobs" className="block hover:text-foreground">
                  <div className="font-medium truncate">{j.role}</div>
                  <div className="text-xs text-muted-foreground">
                    {j.company} · {j.location}
                  </div>
                  {j.salary && <div className="text-xs text-muted-foreground">{j.salary}</div>}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No open roles yet.</p>
        )}
      </RailCard>

      <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
        NexSphere is a hybrid social network — professional identity, communities, and public
        conversation, ranked by intent.
      </p>
    </>
  );
}


function PeopleToKnow() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: people } = useQuery({
    queryKey: ["suggested-people", user?.id ?? "anon"],
    queryFn: () => fetchSuggestedPeople(user?.id),
  });
  const { data: following } = useQuery({
    queryKey: ["following", user?.id],
    queryFn: () => (user ? fetchMyFollowing(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const toggle = useMutation({
    mutationFn: async (targetId: string) => {
      if (!user) throw new Error("Sign in to follow");
      const isFollowing = following?.includes(targetId);
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: targetId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["following", user?.id] }),
  });

  return (
    <RailCard title="People to know" icon={UserPlus}>
      {(!people || people.length === 0) && (
        <p className="text-xs text-muted-foreground">No one else has joined yet — invite someone.</p>
      )}
      <ul className="space-y-3">
        {people?.map((p) => {
          const isFollowing = following?.includes(p.id);
          return (
            <li key={p.id} className="flex items-center gap-3">
              <Avatar name={p.name} hue={p.avatar_hue} size={36} />
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {p.headline ?? `@${p.handle}`}
                </div>
              </div>
              {user ? (
                <button
                  onClick={() => toggle.mutate(p.id)}
                  disabled={toggle.isPending}
                  className={
                    "text-xs px-3 py-1 rounded-full border transition " +
                    (isFollowing
                      ? "border-signal text-signal"
                      : "border-border hover:bg-accent")
                  }
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="text-xs px-3 py-1 rounded-full border border-border hover:bg-accent"
                >
                  Follow
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </RailCard>
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
