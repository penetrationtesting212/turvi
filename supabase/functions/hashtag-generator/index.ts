import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, platform } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating hashtags for platform:', platform);

    const systemPrompt = `You are a social media hashtag expert. Generate relevant hashtags for the given content and platform.
Return a JSON object with this structure:
{
  "trending": ["#hashtag1", "#hashtag2"],
  "niche": ["#hashtag3", "#hashtag4"],
  "branded": ["#hashtag5", "#hashtag6"],
  "recommended": ["#hashtag7", "#hashtag8"],
  "usage": "best practices for using these hashtags",
  "optimalCount": "recommended number of hashtags for this platform"
}`;

    const userPrompt = `Generate relevant hashtags for this ${platform} post: "${content}". Include trending, niche-specific, and branded hashtags. Provide 20-30 hashtags total.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    const hashtagData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(resultText);

    console.log('Hashtags generated successfully');

    return new Response(JSON.stringify(hashtagData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in hashtag-generator function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
