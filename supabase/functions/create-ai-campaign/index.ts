import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goal, targetAudience, budget, channels } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Extract JWT token and decode to get user
    const token = authHeader.replace('Bearer ', '');
    const [, payload] = token.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    const userId = decodedPayload.sub;

    if (!userId) {
      throw new Error('Invalid token');
    }

    console.log('Creating AI campaign for user:', userId);

    // Use Lovable AI to generate campaign strategy
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert marketing strategist. Create comprehensive multi-channel campaign strategies with specific content, timing, and audience targeting recommendations.'
          },
          {
            role: 'user',
            content: `Create a detailed marketing campaign strategy:
Goal: ${goal}
Target Audience: ${JSON.stringify(targetAudience)}
Budget: $${budget}
Channels: ${channels.join(', ')}

Provide:
1. Campaign name
2. Optimal posting times for each channel
3. Content themes and messaging
4. Target audience segments
5. Budget allocation per channel
6. Success metrics
7. 3-5 specific content pieces for each channel`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      console.error('AI API error:', error);
      throw new Error('Failed to generate campaign strategy');
    }

    const aiData = await aiResponse.json();
    const strategy = aiData.choices[0].message.content;

    // Parse AI response and create structured campaign data
    const campaignData = {
      name: goal,
      campaign_type: 'automated',
      target_audience: targetAudience,
      channels: channels,
      content: {
        strategy: strategy,
        generatedAt: new Date().toISOString()
      },
      schedule: {
        channels: channels.map((channel: string) => ({
          channel,
          optimalTimes: ['09:00', '12:00', '17:00'], // AI could specify these
          frequency: 'daily'
        }))
      },
      ai_recommendations: {
        budget_allocation: channels.reduce((acc: Record<string, number>, channel: string) => {
          acc[channel] = Math.floor(budget / channels.length);
          return acc;
        }, {} as Record<string, number>),
        strategy_summary: strategy.substring(0, 500)
      },
      auto_optimize: true,
      status: 'draft'
    };

    // Create Supabase client for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Save campaign to database
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .insert({
        user_id: userId,
        ...campaignData
      })
      .select()
      .single();

    if (campaignError) {
      console.error('Database error:', campaignError);
      throw campaignError;
    }

    console.log('Campaign created successfully:', campaign.id);

    return new Response(
      JSON.stringify({ 
        campaign,
        message: 'AI campaign created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-ai-campaign:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});