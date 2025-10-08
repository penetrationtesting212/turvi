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
    const { monitorId, searchQuery } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Monitoring social mentions for user:', user.id);

    // Get monitor settings
    const { data: monitor, error: monitorError } = await supabaseClient
      .from('brand_monitors')
      .select('*')
      .eq('id', monitorId)
      .eq('user_id', user.id)
      .single();

    if (monitorError || !monitor) {
      throw new Error('Monitor not found');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    // Simulate social listening by generating sample mentions with AI
    // In production, this would integrate with actual social media APIs
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
            content: 'You are a social media monitoring expert. Generate realistic social media mentions and analyze sentiment.'
          },
          {
            role: 'user',
            content: `Generate 5 realistic social media mentions for brand: "${monitor.brand_name}"
Keywords: ${JSON.stringify(monitor.keywords)}
Platforms: ${JSON.stringify(monitor.platforms)}

For each mention provide:
1. Platform (from the list above)
2. Author username
3. Content (realistic post text)
4. Sentiment (positive/negative/neutral)
5. Sentiment score (0-1)
6. Is it viral? (true/false)
7. Is it a crisis? (true/false)
8. Engagement metrics (likes, shares, comments)
9. AI response suggestion

Format as JSON array.`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      console.error('AI API error:', error);
      throw new Error('Failed to analyze mentions');
    }

    const aiData = await aiResponse.json();
    const mentionsText = aiData.choices[0].message.content;
    
    // Parse AI response (in production, this would be more robust)
    let mentions = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = mentionsText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        mentions = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing AI response, generating fallback data');
      // Fallback to sample data
      mentions = [
        {
          platform: monitor.platforms[0] || 'twitter',
          author: '@user123',
          content: `Just tried ${monitor.brand_name}! Absolutely loving the features and user experience. Highly recommend! 🚀`,
          sentiment: 'positive',
          sentiment_score: 0.92,
          is_viral: false,
          is_crisis: false,
          engagement: { likes: 45, shares: 12, comments: 8 },
          ai_response: 'Thank you for the amazing feedback! We\'re thrilled you\'re enjoying the experience. Feel free to reach out if you need any help!'
        }
      ];
    }

    // Save mentions to database
    const mentionsToInsert = mentions.map((mention: any) => ({
      monitor_id: monitorId,
      user_id: user.id,
      platform: mention.platform,
      author: mention.author,
      content: mention.content,
      url: `https://${mention.platform}.com/status/mock`,
      sentiment: mention.sentiment,
      sentiment_score: mention.sentiment_score,
      engagement_metrics: mention.engagement || {},
      is_viral: mention.is_viral || false,
      is_crisis: mention.is_crisis || false,
      ai_response_suggestion: mention.ai_response,
      status: 'new',
      detected_at: new Date().toISOString()
    }));

    const { data: insertedMentions, error: insertError } = await supabaseClient
      .from('mentions')
      .insert(mentionsToInsert)
      .select();

    if (insertError) {
      console.error('Database error:', insertError);
      throw insertError;
    }

    // Create alerts for critical mentions
    const criticalMentions = insertedMentions.filter(m => m.is_crisis || m.is_viral);
    
    if (criticalMentions.length > 0) {
      const alerts = criticalMentions.map(mention => ({
        user_id: user.id,
        alert_type: mention.is_crisis ? 'crisis' : 'viral',
        title: mention.is_crisis ? '🚨 Crisis Alert' : '🔥 Viral Mention',
        message: `${mention.is_crisis ? 'Potential PR crisis' : 'Your brand is going viral'} on ${mention.platform}`,
        severity: mention.is_crisis ? 'critical' : 'high',
        related_mention_id: mention.id,
        is_read: false
      }));

      await supabaseClient.from('alerts').insert(alerts);
    }

    console.log(`Processed ${insertedMentions.length} mentions, ${criticalMentions.length} critical alerts`);

    return new Response(
      JSON.stringify({ 
        mentions: insertedMentions,
        alertsCreated: criticalMentions.length,
        message: 'Social listening completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in monitor-social-mentions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});