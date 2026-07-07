import { supabase } from "@/integrations/supabase/client";

export type DbPost = {
  id: string;
  author_id: string;
  kind: "quick" | "article" | "portfolio" | "media";
  title: string | null;
  content: string;
  tags: string[] | null;
  lane: "Professional" | "Community" | "Trending" | "Friends";
  created_at: string;
  profiles: {
    id: string;
    handle: string;
    name: string;
    headline: string | null;
    avatar_hue: number;
  } | null;
  likes: { user_id: string }[];
};

export async function fetchPosts(): Promise<DbPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, author_id, kind, title, content, tags, lane, created_at, profiles!posts_author_id_fkey(id, handle, name, headline, avatar_hue), likes(user_id)",
    )
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as unknown as DbPost[];
}

export async function fetchSuggestedPeople(excludeId?: string) {
  let q = supabase
    .from("profiles")
    .select("id, handle, name, headline, avatar_hue")
    .order("created_at", { ascending: false })
    .limit(8);
  if (excludeId) q = q.neq("id", excludeId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchMyFollowing(userId: string) {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.following_id as string);
}

// ================= JOBS =================

export type DbJob = {
  id: string;
  role: string;
  company: string;
  location: string;
  salary: string | null;
  employment_type: string;
  skills: string[];
  description: string | null;
  apply_url: string | null;
  created_at: string;
};

export async function fetchJobs(): Promise<DbJob[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("id, role, company, location, salary, employment_type, skills, description, apply_url, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function fetchMyJobSaves(userId: string) {
  const { data, error } = await supabase.from("job_saves").select("job_id").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.job_id as string);
}

// ================= COMMUNITIES =================

export type DbCommunity = {
  id: string;
  slug: string;
  name: string;
  topic: string | null;
  description: string | null;
  privacy: "public" | "private";
  created_at: string;
  community_members: { user_id: string }[];
};

export async function fetchCommunities(): Promise<DbCommunity[]> {
  const { data, error } = await supabase
    .from("communities")
    .select("id, slug, name, topic, description, privacy, created_at, community_members(user_id)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as DbCommunity[];
}

// ================= EVENTS =================

export type DbEvent = {
  id: string;
  title: string;
  description: string | null;
  when_at: string;
  online: boolean;
  location: string | null;
  host_name: string | null;
  event_rsvps: { user_id: string }[];
};

export async function fetchEvents(): Promise<DbEvent[]> {
  const { data, error } = await supabase
    .from("events")
    .select("id, title, description, when_at, online, location, host_name, event_rsvps(user_id)")
    .gte("when_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString())
    .order("when_at", { ascending: true })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as unknown as DbEvent[];
}

// ================= MESSAGES =================

export type MemberProfile = {
  id: string;
  name: string;
  handle: string;
  avatar_hue: number;
};

export type DbConversation = {
  id: string;
  is_group: boolean;
  title: string | null;
  last_message_at: string;
  members: MemberProfile[];
};

export async function fetchConversations(userId: string): Promise<DbConversation[]> {
  const { data: mine, error: e1 } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", userId);
  if (e1) throw e1;
  const ids = (mine ?? []).map((r) => r.conversation_id as string);
  if (ids.length === 0) return [];

  const { data: convs, error: e2 } = await supabase
    .from("conversations")
    .select("id, is_group, title, last_message_at")
    .in("id", ids)
    .order("last_message_at", { ascending: false });
  if (e2) throw e2;

  const { data: allMembers, error: e3 } = await supabase
    .from("conversation_members")
    .select("conversation_id, user_id")
    .in("conversation_id", ids);
  if (e3) throw e3;

  const memberIds = Array.from(new Set((allMembers ?? []).map((m) => m.user_id as string)));
  const { data: profiles, error: e4 } = await supabase
    .from("profiles")
    .select("id, name, handle, avatar_hue")
    .in("id", memberIds);
  if (e4) throw e4;
  const byId = new Map<string, MemberProfile>((profiles ?? []).map((p) => [p.id, p]));

  return (convs ?? []).map((c) => ({
    ...c,
    members: (allMembers ?? [])
      .filter((m) => m.conversation_id === c.id)
      .map((m) => byId.get(m.user_id as string))
      .filter((p): p is MemberProfile => !!p),
  }));
}

export type DbMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export async function fetchMessages(conversationId: string): Promise<DbMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw error;
  return data ?? [];
}

/** Find an existing 1:1 conversation with a peer, or create one. */
export async function openDirectConversation(myId: string, peerId: string): Promise<string> {
  // Look for a shared, non-group conversation.
  const { data: mine, error: e1 } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", myId);
  if (e1) throw e1;
  const ids = (mine ?? []).map((r) => r.conversation_id as string);
  if (ids.length > 0) {
    const { data: shared, error: e2 } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", peerId)
      .in("conversation_id", ids);
    if (e2) throw e2;
    for (const row of shared ?? []) {
      const { data: conv } = await supabase
        .from("conversations")
        .select("id, is_group")
        .eq("id", row.conversation_id as string)
        .maybeSingle();
      if (conv && !conv.is_group) return conv.id as string;
    }
  }

  const { data: conv, error: e3 } = await supabase
    .from("conversations")
    .insert({ is_group: false, created_by: myId })
    .select("id")
    .single();
  if (e3) throw e3;
  const { error: e4 } = await supabase.from("conversation_members").insert([
    { conversation_id: conv.id, user_id: myId },
    { conversation_id: conv.id, user_id: peerId },
  ]);
  if (e4) throw e4;
  return conv.id;
}

// ================= UTILS =================

export function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

export function whenLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}
