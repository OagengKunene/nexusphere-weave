
-- ============ JOBS ============
CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  role text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  salary text,
  employment_type text NOT NULL DEFAULT 'Full-time',
  skills text[] NOT NULL DEFAULT '{}',
  description text,
  apply_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs are public" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "signed-in users can post jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "poster can update job" ON public.jobs FOR UPDATE TO authenticated USING (auth.uid() = posted_by);
CREATE POLICY "poster can delete job" ON public.jobs FOR DELETE TO authenticated USING (auth.uid() = posted_by);

CREATE TABLE public.job_saves (
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (job_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.job_saves TO authenticated;
GRANT ALL ON public.job_saves TO service_role;
ALTER TABLE public.job_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own job saves readable" ON public.job_saves FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own job saves writable" ON public.job_saves FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own job saves deletable" ON public.job_saves FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ COMMUNITIES ============
CREATE TABLE public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  topic text,
  description text,
  privacy text NOT NULL DEFAULT 'public' CHECK (privacy IN ('public','private')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.communities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.communities TO authenticated;
GRANT ALL ON public.communities TO service_role;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "communities are public" ON public.communities FOR SELECT USING (true);
CREATE POLICY "signed-in users can create communities" ON public.communities FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "creator can update community" ON public.communities FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "creator can delete community" ON public.communities FOR DELETE TO authenticated USING (auth.uid() = created_by);

CREATE TABLE public.community_members (
  community_id uuid NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);
GRANT SELECT ON public.community_members TO anon;
GRANT SELECT, INSERT, DELETE ON public.community_members TO authenticated;
GRANT ALL ON public.community_members TO service_role;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memberships are public" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "user can join" ON public.community_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user can leave" ON public.community_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ EVENTS ============
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  when_at timestamptz NOT NULL,
  online boolean NOT NULL DEFAULT true,
  location text,
  host_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events are public" ON public.events FOR SELECT USING (true);
CREATE POLICY "signed-in users can host events" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "host can update event" ON public.events FOR UPDATE TO authenticated USING (auth.uid() = host_id);
CREATE POLICY "host can delete event" ON public.events FOR DELETE TO authenticated USING (auth.uid() = host_id);

CREATE TABLE public.event_rsvps (
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);
GRANT SELECT ON public.event_rsvps TO anon;
GRANT SELECT, INSERT, DELETE ON public.event_rsvps TO authenticated;
GRANT ALL ON public.event_rsvps TO service_role;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rsvps are public counts" ON public.event_rsvps FOR SELECT USING (true);
CREATE POLICY "user can rsvp" ON public.event_rsvps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user can un-rsvp" ON public.event_rsvps FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ MESSAGES ============
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_group boolean NOT NULL DEFAULT false,
  title text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.conversation_members (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conv_created_idx ON public.messages(conversation_id, created_at);

-- Helper to break RLS recursion between conversations/members
CREATE OR REPLACE FUNCTION public.is_conversation_member(_conv uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = _conv AND user_id = _user
  )
$$;

GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read conversations" ON public.conversations FOR SELECT TO authenticated
  USING (public.is_conversation_member(id, auth.uid()));
CREATE POLICY "signed-in users create conversations" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "members bump last_message_at" ON public.conversations FOR UPDATE TO authenticated
  USING (public.is_conversation_member(id, auth.uid()));

GRANT SELECT, INSERT, DELETE ON public.conversation_members TO authenticated;
GRANT ALL ON public.conversation_members TO service_role;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read membership rows" ON public.conversation_members FOR SELECT TO authenticated
  USING (public.is_conversation_member(conversation_id, auth.uid()));
-- Any signed-in user can add rows (self or peers) during conversation creation;
-- creation is client-side and constrained to two- or few-user conversations.
CREATE POLICY "signed-in users add members" ON public.conversation_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "user can leave conversation" ON public.conversation_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read messages" ON public.messages FOR SELECT TO authenticated
  USING (public.is_conversation_member(conversation_id, auth.uid()));
CREATE POLICY "members send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.is_conversation_member(conversation_id, auth.uid()));

-- ============ SEED DATA ============
INSERT INTO public.jobs (role, company, location, salary, employment_type, skills, description) VALUES
  ('Senior Frontend Engineer', 'Vercel', 'Remote · EU', '$180–220K', 'Full-time', ARRAY['React','TypeScript','Edge'], 'Own the Next.js dashboard experience end to end.'),
  ('Design Engineer', 'Linear', 'Remote · Global', '$170–210K', 'Full-time', ARRAY['React','Motion','Design Systems'], 'Ship pixel-perfect craft across Linear web.'),
  ('Staff ML Engineer', 'Cohere', 'Toronto · Hybrid', '$240–290K', 'Full-time', ARRAY['PyTorch','Distributed','LLMs'], 'Scale retrieval-augmented models to production.'),
  ('Product Manager, Growth', 'Notion', 'SF · Hybrid', '$200–250K', 'Full-time', ARRAY['Analytics','Experiments'], 'Own activation and conversion loops.'),
  ('Backend Engineer (Rust)', 'Fly.io', 'Remote', '$170–220K', 'Full-time', ARRAY['Rust','Postgres','Ops'], 'Edge platform internals, control plane, and DBs.');

INSERT INTO public.communities (slug, name, topic, description, privacy) VALUES
  ('design-engineering', 'Design Engineering', 'Craft · tokens · motion', 'Where designers who code and engineers who care about craft trade notes.', 'public'),
  ('africa-health-tech', 'Africa Health Tech', 'Systems · policy · funding', 'Founders, clinicians, and operators building health infra across the continent.', 'public'),
  ('rustaceans-weekly', 'Rustaceans Weekly', 'Systems · performance', 'Weekly deep-dives into Rust in production.', 'public'),
  ('lagos-devs', 'Lagos Devs Collective', 'Meetups · mentorship', 'IRL meetups, code reviews, and mentorship in Lagos.', 'private'),
  ('weekend-woodworkers', 'Weekend Woodworkers', 'Joinery · finishing', 'Hand-tool joinery, finishing, and shop builds.', 'public'),
  ('reading-room', 'The Reading Room', 'Long-form journalism', 'A slow feed of the best long-form writing on the internet.', 'private');

INSERT INTO public.events (title, description, when_at, online, location, host_name) VALUES
  ('The State of TypeScript 2026', 'A panel on where TS is heading — decorators, ESM, and inference.', now() + interval '3 days' + interval '18 hours', true, NULL, 'TS United'),
  ('Portfolio Review Night', 'Small-group crits with senior designers.', now() + interval '5 days' + interval '19 hours', true, NULL, 'Design Buddies'),
  ('Cape Town Founders Dinner', 'Long-table dinner with early-stage founders.', now() + interval '9 days' + interval '19 hours', false, 'Cape Town, ZA', 'Silicon Cape'),
  ('WASM at the Edge', 'Live demo: shipping WASM workloads to CDN nodes.', now() + interval '12 days' + interval '17 hours', true, NULL, 'Edge Guild');
