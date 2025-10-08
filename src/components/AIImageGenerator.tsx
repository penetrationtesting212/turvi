import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AIImageGenerator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please describe the image you want to create",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedImage(data.imageUrl);
      
      // Save to database
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        await supabase.from("generated_images").insert({
          user_id: session.session.user.id,
          prompt: prompt,
          image_url: data.imageUrl,
        });
      }

      toast({
        title: "Image generated!",
        description: "Your AI-generated image is ready and saved",
      });
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'ai-generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded!",
      description: "Image saved to your device",
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>AI Image Generator</CardTitle>
            <CardDescription>Create stunning visuals from text descriptions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Image Description</Label>
          <Input
            id="prompt"
            placeholder="E.g., A modern workspace with laptop and coffee, professional marketing theme"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={loading}
          className="bg-gradient-primary w-full"
        >
          {loading ? "Generating..." : "Generate Image"}
        </Button>

        {generatedImage && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <Label>Generated Image</Label>
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden border border-border/50">
              <img 
                src={generatedImage} 
                alt="AI Generated" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIImageGenerator;
