-- Drop appointments table
DROP TABLE IF EXISTS public.appointments CASCADE;

-- Create marketing leads table for digital marketing
CREATE TABLE public.marketing_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  website TEXT,
  lead_source TEXT NOT NULL DEFAULT 'website',
  lead_status TEXT NOT NULL DEFAULT 'new',
  lead_score INTEGER DEFAULT 0,
  industry TEXT,
  budget_range TEXT,
  services_interested JSONB DEFAULT '[]'::jsonb,
  message TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketing_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own leads"
ON public.marketing_leads
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own leads"
ON public.marketing_leads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
ON public.marketing_leads
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
ON public.marketing_leads
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_marketing_leads_updated_at
BEFORE UPDATE ON public.marketing_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();