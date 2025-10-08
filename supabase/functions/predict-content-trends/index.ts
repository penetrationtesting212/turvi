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
    const { industry, niche, timeframe } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a trend analysis expert with access to real-time web data. Your job is to predict emerging trends before they peak by analyzing:
- Current search volume patterns
- Social media conversations
- Industry news and developments
- Seasonal patterns
- Historical trend data

Return predictions as a JSON array of trend objects.`;

    const userPrompt = `Predict emerging content trends for the next ${timeframe} days in:
Industry: ${industry}
${niche ? `Niche: ${niche}` : ''}

Analyze current web activity and predict 3-5 topics that will trend. For each trend provide:
{
  "topic": "Brief trend topic",
  "trendScore": 0-100 (likelihood to trend),
  "predictedPeakDate": "YYYY-MM-DD",
  "reasoning": "Why this will trend",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "contentSuggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Consider current events, seasonal factors, and industry developments. Return only the JSON array.`;

    console.log("Predicting trends for:", { industry, niche, timeframe });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No trends generated");
    }

    // Extract JSON from response
    let trends;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      trends = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (parseError) {
      console.error("Failed to parse trends JSON:", parseError);
      trends = [];
    }

    console.log("Trends predicted successfully:", trends.length);

    return new Response(
      JSON.stringify({ trends }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in predict-content-trends function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
