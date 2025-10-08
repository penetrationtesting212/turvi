-- Fix Critical Security Issues

-- 1. Add organization context for marketing leads
ALTER TABLE public.marketing_leads 
ADD COLUMN IF NOT EXISTS organization_id UUID,
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;

-- Create organizations table for proper multi-tenant architecture
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create organization members table
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Drop existing marketing_leads policies
DROP POLICY IF EXISTS "Users can view own leads" ON public.marketing_leads;
DROP POLICY IF EXISTS "Users can create own leads" ON public.marketing_leads;
DROP POLICY IF EXISTS "Users can update own leads" ON public.marketing_leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON public.marketing_leads;

-- Create improved RLS policies for marketing_leads with organization context
CREATE POLICY "Users can view own or organization leads"
  ON public.marketing_leads
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR (
      organization_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE organization_id = marketing_leads.organization_id 
        AND user_id = auth.uid()
      )
    )
    OR (is_shared = true AND assigned_to = auth.uid())
  );

CREATE POLICY "Users can create leads in their organization"
  ON public.marketing_leads
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      organization_id IS NULL 
      OR EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE organization_id = marketing_leads.organization_id 
        AND user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own or assigned leads"
  ON public.marketing_leads
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR assigned_to = auth.uid()
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can delete own leads or admins can delete any"
  ON public.marketing_leads
  FOR DELETE
  USING (
    auth.uid() = user_id 
    OR has_role(auth.uid(), 'admin')
  );

-- Organization policies
CREATE POLICY "Users can view their organizations"
  ON public.organizations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members 
      WHERE organization_id = organizations.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can create organizations"
  ON public.organizations
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Organization members policies
CREATE POLICY "Users can view members of their organizations"
  ON public.organization_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.organization_id = organization_members.organization_id 
      AND om.user_id = auth.uid()
    )
  );

-- 2. Encrypt social_accounts credentials using pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add encrypted_credentials column
ALTER TABLE public.social_accounts 
ADD COLUMN IF NOT EXISTS encrypted_credentials BYTEA;

-- Create function to encrypt credentials
CREATE OR REPLACE FUNCTION public.encrypt_social_credentials()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key TEXT;
BEGIN
  -- Use a secret key from Supabase Vault (you'll need to set this)
  encryption_key := current_setting('app.settings.encryption_key', true);
  
  IF encryption_key IS NULL OR encryption_key = '' THEN
    encryption_key := 'default_key_please_change_in_vault';
  END IF;
  
  -- Encrypt the credentials
  IF NEW.credentials IS NOT NULL THEN
    NEW.encrypted_credentials := pgp_sym_encrypt(
      NEW.credentials::text, 
      encryption_key
    );
    -- Clear the plaintext credentials
    NEW.credentials := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically encrypt credentials
DROP TRIGGER IF EXISTS encrypt_social_credentials_trigger ON public.social_accounts;
CREATE TRIGGER encrypt_social_credentials_trigger
  BEFORE INSERT OR UPDATE ON public.social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_social_credentials();

-- Create function to decrypt credentials (for authorized access only)
CREATE OR REPLACE FUNCTION public.decrypt_social_credentials(encrypted_data BYTEA)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key TEXT;
  decrypted_text TEXT;
BEGIN
  encryption_key := current_setting('app.settings.encryption_key', true);
  
  IF encryption_key IS NULL OR encryption_key = '' THEN
    encryption_key := 'default_key_please_change_in_vault';
  END IF;
  
  decrypted_text := pgp_sym_decrypt(encrypted_data, encryption_key);
  RETURN decrypted_text::jsonb;
END;
$$;

-- Create audit log for sensitive data access
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
  ON public.security_audit_log
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Function to log sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (user_id, action, table_name, record_id, metadata)
  VALUES (auth.uid(), p_action, p_table_name, p_record_id, p_metadata);
END;
$$;