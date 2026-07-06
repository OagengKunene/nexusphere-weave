import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Home,
  Compass,
  Users,
  Briefcase,
  Calendar,
  Bookmark,
  MessageSquare,
  Bell,
  User,
  Settings,
  Plus,
  Search,
} from "lucide-react";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/communities", label: "Communities", icon: Users },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
  children,
  right,
}: {
  children: ReactNode;
  right?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <div className="mx-auto max-w-[1440px] px-4 lg:px-8 grid grid-cols-12 gap-6 pt-6 pb-24">
        <aside className="hidden lg:block col-span-3 xl:col-span-2 sticky top-20 self-start">
          <nav className="space-y-0.5">
            {nav.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to || pathname.startsWith(item.to + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    "flex items-center gap-3 px-3 py-2 rounded-md text-[0.95rem] transition-colors " +
                    (active
                      ? "bg-card text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/60")
                  }
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
                  <span className="tracking-tight">{item.label}</span>
                  {item.label === "Notifications" && (
                    <span className="ml-auto text-[0.65rem] px-1.5 py-0.5 rounded-full bg-signal text-signal-foreground font-medium">
                      6
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <button className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-signal text-signal-foreground font-medium rounded-md px-4 py-2.5 hover:brightness-95 transition">
            <Plus className="h-4 w-4" strokeWidth={2} />
            Create
          </button>

          <p className="mt-8 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
            NexSphere · v0.1
          </p>
        </aside>

        <main className="col-span-12 lg:col-span-6 xl:col-span-7 min-w-0">{children}</main>

        <aside className="hidden xl:block col-span-3 space-y-6 sticky top-20 self-start">
          {right}
        </aside>
      </div>
    </div>
  );
}

function TopBar() {
  const { user, profile, loading } = useAuth();
  const [open, setOpen] = useState(false);
  async function signOut() {
    await supabase.auth.signOut();
    setOpen(false);
  }
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 rule-bottom">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-8 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark />
          <span className="font-display text-2xl leading-none">NexSphere</span>
        </Link>

        <div className="flex-1 max-w-xl relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search people, posts, jobs, groups…"
            className="w-full bg-card border border-border rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-signal/40"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="chip hidden md:inline-flex">
            <span className="signal-dot" />
            Live
          </span>
          {loading ? null : user ? (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="h-9 w-9 rounded-full grid place-items-center font-display text-sm"
                style={{
                  background: `oklch(0.32 0.08 ${profile?.avatar_hue ?? 60})`,
                  color: "oklch(0.96 0.06 60)",
                }}
                aria-label="Your account"
              >
                {(profile?.name ?? user.email ?? "?").slice(0, 2).toUpperCase()}
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-md p-2 text-sm shadow-lg">
                  <div className="px-2 py-1.5">
                    <div className="font-medium truncate">{profile?.name ?? "You"}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      @{profile?.handle ?? user.email}
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="block px-2 py-1.5 rounded hover:bg-accent"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={signOut}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-accent text-heat"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="text-sm px-4 py-1.5 rounded-md bg-signal text-signal-foreground font-medium hover:brightness-95"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <circle cx="13" cy="13" r="12" stroke="currentColor" strokeOpacity="0.5" />
      <circle cx="13" cy="13" r="6" fill="var(--signal)" />
      <circle cx="20" cy="8" r="2" fill="var(--heat)" />
    </svg>
  );
}
