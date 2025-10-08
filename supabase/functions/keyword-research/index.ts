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
    const { niche, location } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Researching keywords for niche:', niche);

    const systemPrompt = `You are a keyword research expert. Analyze the given niche and provide trending keywords with search data.
Return a JSON object with this structure:
{
  "keywords": [
    {
      "keyword": "keyword phrase",
      "searchVolume": "estimated monthly searches",
      "difficulty": "easy|medium|hard",
      "trend": "rising|stable|declining",
      "cpc": "estimated cost per click",
      "intent": "informational|commercial|transactional"
    }
  ],
  "longTailKeywords": ["keyword 1", "keyword 2"],
  "relatedTopics": ["topic 1", "topic 2"],
  "seasonalTrends": "brief analysis of seasonal patterns"
}`;

    const userPrompt = `Research trending keywords for the niche: "${niche}"${location ? ` in ${location}` : ''}. Provide 10-15 relevant keywords with realistic data.`;

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
    const keywordData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(resultText);

    console.log('Keywords researched successfully');

    return new Response(JSON.stringify(keywordData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in keyword-research function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
