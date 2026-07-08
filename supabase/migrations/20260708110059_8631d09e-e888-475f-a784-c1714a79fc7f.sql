
-- 1. Communities: hide private communities from non-members
DROP POLICY IF EXISTS "communities are public" ON public.communities;
CREATE POLICY "communities visible to members or if public"
ON public.communities FOR SELECT
TO anon, authenticated
USING (
  privacy = 'public'
  OR (auth.uid() IS NOT NULL AND auth.uid() = created_by)
  OR (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.community_members cm
    WHERE cm.community_id = communities.id AND cm.user_id = auth.uid()
  ))
);

-- 2. Conversation members: only existing members / creators can add others; anyone may add self to their own conversation
DROP POLICY IF EXISTS "signed-in users add members" ON public.conversation_members;
CREATE POLICY "members or creator add participants"
ON public.conversation_members FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    public.is_conversation_member(conversation_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.created_by = auth.uid()
    )
  )
);

-- 3. Restrict is_conversation_member so it can only report on the caller
CREATE OR REPLACE FUNCTION public.is_conversation_member(_conv uuid, _user uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = _conv
      AND user_id = _user
      AND _user = auth.uid()
  )
$$;

-- 4. Jobs: validate apply_url scheme at the database
ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_apply_url_http_only
  CHECK (apply_url IS NULL OR apply_url ~* '^https?://');
