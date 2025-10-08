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
    const { leadStage, leadBehavior, industry } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert email marketing strategist specializing in lead nurturing. Create personalized follow-up sequences that:
- Match the lead's current stage and behavior
- Use proven engagement tactics
- Balance value delivery with sales progression
- Include strategic timing between emails
- Adapt to industry-specific needs`;

    const userPrompt = `Create a follow-up email sequence for:

Lead Stage: ${leadStage}
Lead Behavior: ${leadBehavior}
${industry ? `Industry: ${industry}` : ''}

Generate 3-5 emails with optimal timing. Return a JSON object:
{
  "sequenceName": "Descriptive sequence name",
  "totalDays": number,
  "emails": [
    {
      "day": number,
      "subject": "Email subject line",
      "body": "Full email body with personalization",
      "purpose": "Email goal"
    }
  ],
  "bestPractices": ["practice1", "practice2", "practice3"]
}

Make emails conversational, value-focused, and action-oriented. Return only JSON.`;

    console.log("Generating follow-up sequence:", { leadStage, leadBehavior, industry });

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
        temperature: 0.8,
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
      throw new Error("No sequence generated");
    }

    // Extract JSON from response
    let sequence;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      sequence = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (parseError) {
      console.error("Failed to parse sequence JSON:", parseError);
      throw new Error("Failed to parse sequence data");
    }

    console.log("Follow-up sequence generated successfully");

    return new Response(
      JSON.stringify({ sequence }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-followup-sequence function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
