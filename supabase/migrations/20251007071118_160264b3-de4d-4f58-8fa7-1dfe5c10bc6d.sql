-- Create email_segments table for audience segmentation
CREATE TABLE public.email_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  subscriber_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create email_workflows table for automation
CREATE TABLE public.email_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_workflows ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_segments
CREATE POLICY "Users can view own segments"
  ON public.email_segments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own segments"
  ON public.email_segments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own segments"
  ON public.email_segments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own segments"
  ON public.email_segments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for email_workflows
CREATE POLICY "Users can view own workflows"
  ON public.email_workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workflows"
  ON public.email_workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows"
  ON public.email_workflows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows"
  ON public.email_workflows FOR DELETE
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_email_segments_updated_at
  BEFORE UPDATE ON public.email_segments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_workflows_updated_at
  BEFORE UPDATE ON public.email_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();