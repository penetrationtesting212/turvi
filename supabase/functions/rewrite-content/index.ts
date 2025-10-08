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
    const { content, format } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const formatMap: Record<string, string> = {
      'blog': 'a detailed blog post format with proper headings and sections',
      'social': 'engaging social media posts (Twitter, LinkedIn, Facebook)',
      'email': 'professional email format with subject line and body',
      'landing': 'compelling landing page copy with headlines and CTAs',
      'ad': 'attention-grabbing advertisement copy',
      'summary': 'concise summary highlighting key points'
    };

    const targetFormat = formatMap[format] || 'a different format';

    const systemPrompt = `You are an expert content rewriter and repurposing specialist. 
Transform content into different formats while maintaining the core message and value.
Adapt tone, structure, and length appropriately for each format.`;

    const userPrompt = `Rewrite the following content into ${targetFormat}:

Original Content:
${content}

Requirements:
- Maintain the core message and key points
- Adapt the tone and structure for ${format} format
- Make it engaging and appropriate for the target format
- Keep it concise yet impactful`;

    console.log("Rewriting content to format:", format);

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
    const rewrittenContent = data.choices?.[0]?.message?.content;

    if (!rewrittenContent) {
      throw new Error("No content generated");
    }

    console.log("Content rewritten successfully");

    return new Response(
      JSON.stringify({ rewrittenContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in rewrite-content function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
