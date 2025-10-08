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
    const { content, brandGuidelines } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Checking brand voice consistency');

    const systemPrompt = `You are a brand voice consistency expert. Analyze the content against brand guidelines and check for consistency.
Return a JSON object with this structure:
{
  "consistencyScore": 85,
  "tone": "professional|casual|friendly|formal",
  "toneMatch": true,
  "voiceCharacteristics": ["characteristic 1", "characteristic 2"],
  "matches": ["what matches well", "another match"],
  "mismatches": ["what doesn't match", "another mismatch"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "examples": ["example improvement 1", "example improvement 2"]
}`;

    const userPrompt = `Check if this content matches the brand guidelines:\n\nBrand Guidelines: ${brandGuidelines}\n\nContent to Check: ${content}`;

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
    const voiceData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(resultText);

    console.log('Brand voice checked successfully');

    return new Response(JSON.stringify(voiceData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in brand-voice-checker function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
