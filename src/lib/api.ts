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

export function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}
