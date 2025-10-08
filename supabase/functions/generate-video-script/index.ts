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
    const { topic, duration, platform, tone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert video script writer specializing in creating engaging, platform-optimized scripts. Create scripts with:
- Strong hooks in the first 3 seconds
- Clear structure (hook, content, call-to-action)
- Natural dialogue flow
- Platform-specific formatting
- Scene directions and visual cues
- Timestamps for key moments`;

    const userPrompt = `Create a ${duration}-second video script for ${platform} about: ${topic}

Tone: ${tone}
Duration: ${duration} seconds

Format the script with:
[00:00] - Timestamps
VISUALS: Description of what viewers see
AUDIO/VOICEOVER: What is said
CALL-TO-ACTION: Clear next step

Make it ${tone} and optimized for ${platform}'s algorithm and audience.`;

    console.log("Generating video script:", { topic, duration, platform, tone });

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
    const script = data.choices?.[0]?.message?.content;

    if (!script) {
      throw new Error("No script generated");
    }

    console.log("Video script generated successfully");

    return new Response(
      JSON.stringify({ script }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-video-script function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
