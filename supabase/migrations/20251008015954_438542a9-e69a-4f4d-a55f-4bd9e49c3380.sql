-- Create security definer function to check organization membership
-- This bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.is_organization_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
  );
$$;

-- Drop the existing recursive policy
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;

-- Create new policy using the security definer function
CREATE POLICY "Users can view members of their organizations"
ON public.organization_members
FOR SELECT
USING (public.is_organization_member(auth.uid(), organization_id));

-- Update marketing_leads policy to use the new function
DROP POLICY IF EXISTS "Users can view own or organization leads" ON public.marketing_leads;

CREATE POLICY "Users can view own or organization leads"
ON public.marketing_leads
FOR SELECT
USING (
  (auth.uid() = user_id) 
  OR ((organization_id IS NOT NULL) AND public.is_organization_member(auth.uid(), organization_id))
  OR ((is_shared = true) AND (assigned_to = auth.uid()))
);