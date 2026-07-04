import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { conversations } from "@/lib/mock-data";
import { Avatar } from "@/components/layout/Avatar";
import { Send, Paperclip } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/messages")({
  component: Messages,
});

function Messages() {
  const [active, setActive] = useState(0);
  const c = conversations[active];

  return (
    <AppShell>
      <div className="bg-card border border-border rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-[70vh]">
        <aside className="rule-bottom md:rule-bottom-0 md:border-r md:border-border">
          <div className="p-4 rule-bottom">
            <h1 className="font-display text-2xl">Messages</h1>
          </div>
          <ul>
            {conversations.map((conv, i) => (
              <li key={conv.name}>
                <button
                  onClick={() => setActive(i)}
                  className={
                    "w-full text-left p-3 flex gap-3 items-start hover:bg-accent/50 transition " +
                    (i === active ? "bg-accent/60" : "")
                  }
                >
                  <Avatar name={conv.name} hue={(i * 60) % 360} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium truncate">{conv.name}</span>
                      <span className="text-[0.68rem] text-muted-foreground shrink-0">{conv.time}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{conv.preview}</div>
                  </div>
                  {conv.unread ? (
                    <span className="text-[0.65rem] bg-signal text-signal-foreground rounded-full px-1.5 py-0.5 font-medium">
                      {conv.unread}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex flex-col">
          <header className="p-4 rule-bottom flex items-center gap-3">
            <Avatar name={c.name} hue={(active * 60) % 360} size={36} />
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground">
                {c.group ? "Group · 12 members" : "Online now"}
              </div>
            </div>
          </header>

          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            <Bubble from="them">Hey — did you get a chance to look at the token spec?</Bubble>
            <Bubble from="me">
              Yeah, mostly loving it. One nit: the semantic layer shouldn't reference raw hues. Wrote up a longer note.
            </Bubble>
            <Bubble from="them">{c.preview}</Bubble>
            <Bubble from="me">On it — pushing a branch tonight.</Bubble>
          </div>

          <footer className="p-3 rule-top flex items-center gap-2">
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-accent">
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              placeholder="Write a message…"
              className="flex-1 bg-transparent px-2 py-2 text-sm focus:outline-none"
            />
            <button className="bg-signal text-signal-foreground rounded-md p-2 hover:brightness-95 transition">
              <Send className="h-4 w-4" />
            </button>
          </footer>
        </section>
      </div>
    </AppShell>
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
