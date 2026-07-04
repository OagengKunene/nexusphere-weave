export type PostKind = "quick" | "article" | "portfolio" | "media";

export type FeedPost = {
  id: string;
  kind: PostKind;
  author: {
    name: string;
    handle: string;
    role: string;
    avatarHue: number;
    verified?: boolean;
  };
  time: string;
  lane: "Professional" | "Community" | "Trending" | "Friends";
  content: string;
  title?: string;
  readMinutes?: number;
  tech?: string[];
  tags?: string[];
  stats: { replies: number; reposts: number; likes: number; views: string };
};

export const feed: FeedPost[] = [
  {
    id: "1",
    kind: "quick",
    author: { name: "Amara Okafor", handle: "amara", role: "Staff Eng · Stripe", avatarHue: 120, verified: true },
    time: "12m",
    lane: "Professional",
    content:
      "Hot take: the interview loop that predicts real performance isn't system design — it's watching a candidate debug a 200-line legacy file they've never seen. Curiosity > pattern recall.",
    tags: ["hiring", "engineering"],
    stats: { replies: 84, reposts: 212, likes: 1_402, views: "48.2K" },
  },
  {
    id: "2",
    kind: "article",
    author: { name: "Dr. Ines Vermeer", handle: "inesv", role: "Principal Researcher · DeepMind", avatarHue: 40 },
    time: "1h",
    lane: "Professional",
    title: "Why small models are quietly winning the enterprise",
    content:
      "For the last two years we assumed scale was the only lever. Deployment data from 340 enterprise pilots tells a different story — latency, cost, and governance are collapsing the frontier.",
    readMinutes: 9,
    tags: ["AI", "research"],
    stats: { replies: 41, reposts: 96, likes: 812, views: "22.7K" },
  },
  {
    id: "3",
    kind: "portfolio",
    author: { name: "Kenji Watari", handle: "kenji", role: "Product Designer · Freelance", avatarHue: 200 },
    time: "3h",
    lane: "Community",
    title: "Halcyon — a calm-tech reader for long-form journalism",
    content:
      "Six-week solo build. Offline-first, single-column reading, ambient soundscapes tied to article length. Shipped to TestFlight last night.",
    tech: ["SwiftUI", "CoreData", "CloudKit", "Figma"],
    tags: ["design", "case-study"],
    stats: { replies: 27, reposts: 58, likes: 604, views: "11.9K" },
  },
  {
    id: "4",
    kind: "quick",
    author: { name: "Lagos Devs Collective", handle: "lagosdevs", role: "Community · 12.4K members", avatarHue: 300 },
    time: "5h",
    lane: "Community",
    content:
      "Reminder — the Saturday meetup moves to Yaba this weekend. Talk lineup: WASM at the edge, building a Yoruba TTS from scratch, and a live code review of a fintech monorepo.",
    tags: ["meetup", "lagos"],
    stats: { replies: 12, reposts: 34, likes: 189, views: "4.1K" },
  },
  {
    id: "5",
    kind: "quick",
    author: { name: "Marcus Reid", handle: "mreid", role: "Recruiter · Anthropic", avatarHue: 20 },
    time: "8h",
    lane: "Trending",
    content:
      "We just opened 14 roles across research engineering and product. If you're tired of vague JDs — every posting has the actual on-call, the actual salary band, and the actual team lead's name.",
    tags: ["hiring", "jobs"],
    stats: { replies: 63, reposts: 141, likes: 998, views: "31.4K" },
  },
];

export const trends = [
  { tag: "#SmallModels", posts: "24.3K", lane: "Technology" },
  { tag: "#DesignEngineering", posts: "8.1K", lane: "Design" },
  { tag: "Champions League", posts: "412K", lane: "Sports · Live" },
  { tag: "#RemoteFirst", posts: "6.7K", lane: "Careers" },
  { tag: "COP Summit", posts: "88.2K", lane: "News" },
];

export const suggestedPeople = [
  { name: "Priya Raman", role: "Founding Eng · Linear", handle: "priyar", mutual: 12 },
  { name: "Tomás Bianchi", role: "CTO · Nubank", handle: "tomasb", mutual: 4 },
  { name: "Naledi Khumalo", role: "Journalist · The Continent", handle: "naledi", mutual: 21 },
];

export const suggestedGroups = [
  { name: "Design Engineering", members: "18.4K", topic: "Craft, tokens, motion" },
  { name: "Africa Health Tech", members: "5.9K", topic: "Systems, policy, funding" },
  { name: "Weekend Woodworkers", members: "22.1K", topic: "Joinery & finishing" },
];

export const upcomingEvents = [
  { title: "The State of TypeScript 2026", when: "Tue · 18:00 GMT", host: "TS United", online: true },
  { title: "Portfolio Review Night", when: "Thu · 19:00 CET", host: "Design Buddies", online: true },
  { title: "Cape Town Founders Dinner", when: "Sat · 19:30 SAST", host: "Silicon Cape", online: false },
];

export const jobMatches = [
  { role: "Senior Frontend Engineer", company: "Vercel", location: "Remote · EU", salary: "$180–220K", match: 94 },
  { role: "Design Engineer", company: "Linear", location: "Remote · Global", salary: "$170–210K", match: 91 },
  { role: "Staff ML Engineer", company: "Cohere", location: "Toronto · Hybrid", salary: "$240–290K", match: 88 },
];

export const communities = [
  { name: "Design Engineering", members: "18,412", posts: "312 this week", topic: "Craft · tokens · motion", privacy: "Public" },
  { name: "Africa Health Tech", members: "5,942", posts: "89 this week", topic: "Systems · policy · funding", privacy: "Public" },
  { name: "Rustaceans Weekly", members: "44,201", posts: "1,204 this week", topic: "Systems · performance", privacy: "Public" },
  { name: "Lagos Devs Collective", members: "12,408", posts: "212 this week", topic: "Meetups · mentorship", privacy: "Private" },
  { name: "Weekend Woodworkers", members: "22,109", posts: "540 this week", topic: "Joinery · finishing", privacy: "Public" },
  { name: "The Reading Room", members: "9,881", posts: "76 this week", topic: "Long-form journalism", privacy: "Private" },
];

export const jobs = [
  { role: "Senior Frontend Engineer", company: "Vercel", location: "Remote · EU", salary: "$180–220K", type: "Full-time", posted: "2d", match: 94, skills: ["React", "TypeScript", "Edge"] },
  { role: "Design Engineer", company: "Linear", location: "Remote · Global", salary: "$170–210K", type: "Full-time", posted: "4d", match: 91, skills: ["React", "Motion", "Design Systems"] },
  { role: "Staff ML Engineer", company: "Cohere", location: "Toronto · Hybrid", salary: "$240–290K", type: "Full-time", posted: "1d", match: 88, skills: ["PyTorch", "Distributed", "LLMs"] },
  { role: "Product Manager, Growth", company: "Notion", location: "SF · Hybrid", salary: "$200–250K", type: "Full-time", posted: "6d", match: 82, skills: ["Analytics", "Experiments"] },
  { role: "Backend Engineer (Rust)", company: "Fly.io", location: "Remote", salary: "$170–220K", type: "Full-time", posted: "3d", match: 79, skills: ["Rust", "Postgres", "Ops"] },
];

export const conversations = [
  { name: "Priya Raman", preview: "Sent you the token spec — LMK if the naming holds up.", time: "4m", unread: 2 },
  { name: "Design Engineering", preview: "Tomás: I'd push back on step 3, the cascade breaks…", time: "22m", unread: 5, group: true },
  { name: "Marcus Reid", preview: "Great — I'll circle back Monday with the panel.", time: "1h", unread: 0 },
  { name: "Kenji Watari", preview: "Screenshots attached. Frame 04 is the one.", time: "3h", unread: 0 },
  { name: "Lagos Devs Collective", preview: "Ada: venue confirmed for Saturday!", time: "1d", unread: 0, group: true },
];

export const notifications = [
  { kind: "follow", text: "Priya Raman started following you", time: "6m" },
  { kind: "like", text: "Amara Okafor and 42 others liked your reply", time: "18m" },
  { kind: "job", text: "New match: Design Engineer at Linear (91%)", time: "1h" },
  { kind: "mention", text: "Dr. Ines Vermeer mentioned you in an article", time: "3h" },
  { kind: "event", text: "Portfolio Review Night starts Thursday", time: "1d" },
  { kind: "group", text: "Design Engineering approved your post", time: "2d" },
];

export const profile = {
  name: "Sade Adeyemi",
  handle: "sade",
  headline: "Design engineer building calm interfaces · ex-Figma, ex-Monzo",
  location: "Lisbon, PT",
  website: "sade.works",
  openToWork: true,
  stats: { followers: "12.4K", following: 481, posts: 1_204 },
  skills: ["React", "TypeScript", "Design Systems", "Motion", "Figma", "SwiftUI"],
  experience: [
    { role: "Design Engineer", company: "Figma", period: "2022 — 2025", detail: "Design systems, plugin platform, motion primitives." },
    { role: "Senior Frontend Engineer", company: "Monzo", period: "2019 — 2022", detail: "Web platform, accessibility, checkout." },
    { role: "Frontend Engineer", company: "Deliveroo", period: "2016 — 2019", detail: "Consumer growth, experimentation." },
  ],
  education: [{ school: "University of Lagos", degree: "BSc Computer Science", period: "2012 — 2016" }],
  portfolio: [
    { title: "Halcyon Reader", tech: ["SwiftUI", "CoreData"], year: "2025" },
    { title: "Monzo Design Tokens", tech: ["React", "Style Dictionary"], year: "2021" },
  ],
};
