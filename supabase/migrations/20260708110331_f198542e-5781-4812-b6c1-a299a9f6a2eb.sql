
-- follows
DROP POLICY IF EXISTS "follows readable by all" ON public.follows;
CREATE POLICY "follows readable by authenticated"
ON public.follows FOR SELECT
TO authenticated
USING (true);

-- community_members
DROP POLICY IF EXISTS "memberships are public" ON public.community_members;
CREATE POLICY "memberships readable by authenticated"
ON public.community_members FOR SELECT
TO authenticated
USING (true);

-- event_rsvps
DROP POLICY IF EXISTS "rsvps are public counts" ON public.event_rsvps;
CREATE POLICY "rsvps readable by authenticated"
ON public.event_rsvps FOR SELECT
TO authenticated
USING (true);
