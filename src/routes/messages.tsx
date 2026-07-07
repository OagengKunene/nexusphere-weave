import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/layout/Avatar";
import { Send, X, MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchConversations,
  fetchMessages,
  fetchSuggestedPeople,
  openDirectConversation,
  timeAgo,
  type DbConversation,
  type MemberProfile,
} from "@/lib/api";

export const Route = createFileRoute("/messages")({
  component: Messages,
});

function Messages() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  const { data: conversations } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => (user ? fetchConversations(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  useEffect(() => {
    if (!activeId && conversations && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  if (!user) {
    return (
      <AppShell>
        <div className="bg-card border border-border rounded-lg p-10 text-center">
          <h1 className="font-display text-3xl mb-2">Messages</h1>
          <p className="text-muted-foreground mb-4">Sign in to start conversations.</p>
          <Link
            to="/auth"
            className="text-sm px-4 py-1.5 rounded-md bg-signal text-signal-foreground font-medium"
          >
            Sign in
          </Link>
        </div>
      </AppShell>
    );
  }

  const active = conversations?.find((c) => c.id === activeId) ?? null;

  return (
    <AppShell>
      <div className="bg-card border border-border rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-[70vh]">
        <aside className="rule-bottom md:rule-bottom-0 md:border-r md:border-border">
          <div className="p-4 rule-bottom flex items-center justify-between">
            <h1 className="font-display text-2xl">Messages</h1>
            <button
              onClick={() => setPicking(true)}
              className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
              aria-label="New message"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </button>
          </div>
          <ul>
            {conversations?.map((conv) => {
              const peer = peerOf(conv, user.id);
              const label = conv.is_group ? conv.title ?? "Group" : peer?.name ?? "Conversation";
              const hue = peer?.avatar_hue ?? 60;
              return (
                <li key={conv.id}>
                  <button
                    onClick={() => setActiveId(conv.id)}
                    className={
                      "w-full text-left p-3 flex gap-3 items-start hover:bg-accent/50 transition " +
                      (conv.id === activeId ? "bg-accent/60" : "")
                    }
                  >
                    <Avatar name={label} hue={hue} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium truncate">{label}</span>
                        <span className="text-[0.68rem] text-muted-foreground shrink-0">
                          {timeAgo(conv.last_message_at)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {conv.is_group ? `${conv.members.length} members` : `@${peer?.handle ?? ""}`}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
            {conversations && conversations.length === 0 && (
              <li className="p-4 text-xs text-muted-foreground">
                No conversations yet. Start one with the pencil icon above.
              </li>
            )}
          </ul>
        </aside>

        <section className="flex flex-col">
          {active ? (
            <ConversationPane conversation={active} userId={user.id} />
          ) : (
            <div className="flex-1 grid place-items-center text-sm text-muted-foreground">
              Pick a conversation.
            </div>
          )}
        </section>
      </div>

      {picking && (
        <NewMessageModal
          userId={user.id}
          onClose={() => setPicking(false)}
          onOpened={(convId) => {
            setPicking(false);
            qc.invalidateQueries({ queryKey: ["conversations", user.id] });
            setActiveId(convId);
          }}
        />
      )}
    </AppShell>
  );
}

function peerOf(conv: DbConversation, myId: string): MemberProfile | null {
  return conv.members.find((m) => m.id !== myId) ?? conv.members[0] ?? null;
}

function ConversationPane({
  conversation,
  userId,
}: {
  conversation: DbConversation;
  userId: string;
}) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery({
    queryKey: ["messages", conversation.id],
    queryFn: () => fetchMessages(conversation.id),
    refetchInterval: 5000,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const peer = peerOf(conversation, userId);
  const label = conversation.is_group ? conversation.title ?? "Group" : peer?.name ?? "Conversation";

  const send = useMutation({
    mutationFn: async () => {
      const body = draft.trim();
      if (!body) return;
      const { error } = await supabase
        .from("messages")
        .insert({ conversation_id: conversation.id, sender_id: userId, body });
      if (error) throw error;
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversation.id);
    },
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["messages", conversation.id] });
      qc.invalidateQueries({ queryKey: ["conversations", userId] });
    },
  });

  return (
    <>
      <header className="p-4 rule-bottom flex items-center gap-3">
        <Avatar name={label} hue={peer?.avatar_hue ?? 60} size={36} />
        <div>
          <div className="font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">
            {conversation.is_group
              ? `${conversation.members.length} members`
              : peer
                ? `@${peer.handle}`
                : ""}
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 p-6 space-y-3 overflow-y-auto">
        {messages?.length === 0 && (
          <div className="text-center text-xs text-muted-foreground">Say hello.</div>
        )}
        {messages?.map((m) => (
          <Bubble key={m.id} from={m.sender_id === userId ? "me" : "them"}>
            {m.body}
          </Bubble>
        ))}
      </div>

      <footer className="p-3 rule-top flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send.mutate();
            }
          }}
          placeholder="Write a message…"
          className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none"
        />
        <button
          onClick={() => send.mutate()}
          disabled={send.isPending || !draft.trim()}
          className="bg-signal text-signal-foreground rounded-md p-2 hover:brightness-95 transition disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
        </button>
      </footer>
    </>
  );
}

function Bubble({ from, children }: { from: "me" | "them"; children: React.ReactNode }) {
  const me = from === "me";
  return (
    <div className={"flex " + (me ? "justify-end" : "justify-start")}>
      <div
        className={
          "max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed " +
          (me
            ? "bg-signal text-signal-foreground rounded-br-sm"
            : "bg-accent text-accent-foreground rounded-bl-sm")
        }
      >
        {children}
      </div>
    </div>
  );
}

function NewMessageModal({
  userId,
  onClose,
  onOpened,
}: {
  userId: string;
  onClose: () => void;
  onOpened: (convId: string) => void;
}) {
  const { data: people } = useQuery({
    queryKey: ["suggested-people", userId],
    queryFn: () => fetchSuggestedPeople(userId),
  });
  const open = useMutation({
    mutationFn: (peerId: string) => openDirectConversation(userId, peerId),
    onSuccess: onOpened,
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl">New message</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        {!people || people.length === 0 ? (
          <p className="text-sm text-muted-foreground">No one else has joined yet.</p>
        ) : (
          <ul className="space-y-2 max-h-[50vh] overflow-y-auto">
            {people.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => open.mutate(p.id)}
                  disabled={open.isPending}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-left"
                >
                  <Avatar name={p.name} hue={p.avatar_hue} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {p.headline ?? `@${p.handle}`}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
