-- Create scheduled_content table for content scheduling
CREATE TABLE IF NOT EXISTS public.scheduled_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL,
  platform TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT scheduled_content_status_check CHECK (status IN ('pending', 'published', 'failed', 'cancelled'))
);

-- Enable RLS
ALTER TABLE public.scheduled_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own scheduled content"
  ON public.scheduled_content
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled content"
  ON public.scheduled_content
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled content"
  ON public.scheduled_content
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled content"
  ON public.scheduled_content
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX idx_scheduled_content_user_scheduled 
  ON public.scheduled_content(user_id, scheduled_for) 
  WHERE status = 'pending';