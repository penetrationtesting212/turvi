-- Create campaigns table for autopilot
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  campaign_type TEXT NOT NULL,
  target_audience JSONB,
  channels JSONB NOT NULL,
  content JSONB NOT NULL,
  schedule JSONB,
  performance_metrics JSONB DEFAULT '{}',
  ai_recommendations JSONB DEFAULT '{}',
  auto_optimize BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  launched_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Create brand monitoring table
CREATE TABLE public.brand_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  keywords JSONB NOT NULL,
  platforms JSONB NOT NULL,
  alert_settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create mentions table for social listening
CREATE TABLE public.mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID NOT NULL REFERENCES public.brand_monitors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  author TEXT,
  content TEXT NOT NULL,
  url TEXT,
  sentiment TEXT NOT NULL,
  sentiment_score DECIMAL(5,2) NOT NULL,
  engagement_metrics JSONB DEFAULT '{}',
  is_viral BOOLEAN DEFAULT false,
  is_crisis BOOLEAN DEFAULT false,
  ai_response_suggestion TEXT,
  status TEXT DEFAULT 'new',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL,
  related_mention_id UUID REFERENCES public.mentions(id) ON DELETE SET NULL,
  related_campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create campaign executions table
CREATE TABLE public.campaign_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  executed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_executions ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY "Users can view own campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON public.campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- Brand monitors policies
CREATE POLICY "Users can view own monitors"
  ON public.brand_monitors FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own monitors"
  ON public.brand_monitors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monitors"
  ON public.brand_monitors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monitors"
  ON public.brand_monitors FOR DELETE
  USING (auth.uid() = user_id);

-- Mentions policies
CREATE POLICY "Users can view own mentions"
  ON public.mentions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own mentions"
  ON public.mentions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mentions"
  ON public.mentions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mentions"
  ON public.mentions FOR DELETE
  USING (auth.uid() = user_id);

-- Alerts policies
CREATE POLICY "Users can view own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON public.alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Campaign executions policies
CREATE POLICY "Users can view own executions"
  ON public.campaign_executions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own executions"
  ON public.campaign_executions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own executions"
  ON public.campaign_executions FOR UPDATE
  USING (auth.uid() = user_id);

-- Add update triggers
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brand_monitors_updated_at
  BEFORE UPDATE ON public.brand_monitors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;