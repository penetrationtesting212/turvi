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
    const { leads } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a lead scoring AI expert. Analyze leads and predict their conversion probability based on:
- Contact information quality (email, phone, company)
- Company size and industry signals
- Engagement level and timing
- Budget indicators
- Message content and intent

Assign scores 0-100 and categorize as hot (80+), warm (50-79), or cold (<50).`;

    const userPrompt = `Score these leads for conversion probability:

${JSON.stringify(leads, null, 2)}

For each lead, return a JSON object with:
{
  "id": "original_id",
  "score": 0-100,
  "conversionProbability": 0-100,
  "reasoning": "Why this score",
  "recommendations": ["action1", "action2", "action3"],
  "priority": "hot|warm|cold"
}

Return only a JSON array of scored leads.`;

    console.log("Scoring leads:", leads.length);

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
        temperature: 0.5,
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
      throw new Error("No scoring data generated");
    }

    // Extract JSON from response
    let scoredLeads;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      scoredLeads = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (parseError) {
      console.error("Failed to parse scoring JSON:", parseError);
      scoredLeads = leads.map((lead: any) => ({
        ...lead,
        score: 50,
        conversionProbability: 50,
        reasoning: "Unable to generate detailed analysis",
        recommendations: ["Follow up within 24 hours"],
        priority: "warm"
      }));
    }

    console.log("Leads scored successfully:", scoredLeads.length);

    return new Response(
      JSON.stringify({ scoredLeads }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in score-leads function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
