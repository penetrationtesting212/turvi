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
    const { phoneNumber, message, mediaUrl } = await req.json();
    
    // For demo purposes - in production, integrate with WhatsApp Business API
    // You'll need to set up WHATSAPP_API_KEY and WHATSAPP_PHONE_NUMBER_ID
    const WHATSAPP_API_KEY = Deno.env.get("WHATSAPP_API_KEY");
    const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    
    if (!WHATSAPP_API_KEY || !WHATSAPP_PHONE_NUMBER_ID) {
      // Return success for demo, but log that credentials are missing
      console.log("WhatsApp credentials not configured - demo mode");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Message queued (Demo mode - configure WhatsApp Business API for production)",
          phoneNumber,
          messagePreview: message.substring(0, 50)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Production WhatsApp Business API integration
    const whatsappPayload: any = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: {
        body: message
      }
    };

    if (mediaUrl) {
      whatsappPayload.type = "image";
      whatsappPayload.image = {
        link: mediaUrl
      };
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(whatsappPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WhatsApp API error:", response.status, errorText);
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("WhatsApp message sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, messageId: data.messages?.[0]?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-whatsapp-message function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
