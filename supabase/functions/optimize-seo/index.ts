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
    const { content, keywords } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert SEO specialist. 
Optimize content for search engines while maintaining readability and value.
Provide keyword integration suggestions, meta descriptions, and SEO improvements.`;

    const userPrompt = `Optimize the following content for SEO with these keywords: ${keywords || 'general SEO best practices'}

Content:
${content}

Provide a JSON response with:
{
  "optimizedContent": "Content with natural keyword integration",
  "metaTitle": "SEO-optimized title (50-60 chars)",
  "metaDescription": "Compelling meta description (150-160 chars)",
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3"],
  "seoScore": 85,
  "recommendations": ["tip1", "tip2", "tip3"]
}`;

    console.log("Optimizing content for SEO");

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
    const seoData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      optimizedContent: resultText,
      metaTitle: "Optimized Title",
      metaDescription: "Optimized description",
      suggestedKeywords: [],
      seoScore: 75,
      recommendations: []
    };

    console.log("SEO optimization complete");

    return new Response(
      JSON.stringify(seoData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in optimize-seo function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
