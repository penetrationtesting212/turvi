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
    const { content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert grammar and style checker. 
Identify grammar errors, style issues, and provide suggestions for improvement.
Be precise and helpful in your corrections.`;

    const userPrompt = `Check the following content for grammar, spelling, and style issues:

Content:
${content}

Provide a JSON response with:
{
  "correctedContent": "Content with all corrections applied",
  "issues": [
    {
      "type": "grammar|spelling|style|punctuation",
      "original": "incorrect text",
      "suggestion": "correct text",
      "explanation": "why this is better"
    }
  ],
  "score": 85,
  "summary": "Overall assessment of the content quality"
}`;

    console.log("Checking grammar and style");

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
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content;

    if (!resultText) {
      throw new Error("No content generated");
    }

    // Parse JSON from the response
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    const grammarData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      correctedContent: resultText,
      issues: [],
      score: 90,
      summary: "Analysis complete"
    };

    console.log("Grammar check complete");

    return new Response(
      JSON.stringify(grammarData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in check-grammar function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
