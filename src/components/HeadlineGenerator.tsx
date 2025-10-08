import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heading } from "lucide-react";

export const HeadlineGenerator = () => {
  const [content, setContent] = useState("");
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content to generate headlines.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('headline-generator', {
        body: { content, count: 5 }
      });

      if (error) throw error;

      setHeadlines(data.headlines);
      toast({
        title: "Headlines Generated",
        description: "5 catchy headlines have been created.",
      });
    } catch (error) {
      console.error('Error generating headlines:', error);
      toast({
        title: "Error",
        description: "Failed to generate headlines. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHeadline = (headline: string) => {
    navigator.clipboard.writeText(headline);
    toast({
      title: "Copied!",
      description: "Headline copied to clipboard.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heading className="h-5 w-5" />
          Headline Generator
        </CardTitle>
        <CardDescription>AI generates catchy headlines for your content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter your content or main topic..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
        
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Headlines"}
        </Button>

        {headlines.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Generated Headlines</h4>
            <div className="space-y-2">
              {headlines.map((headline, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                  <span className="text-sm flex-1">{headline}</span>
                  <Button 
                    onClick={() => handleCopyHeadline(headline)} 
                    variant="ghost" 
                    size="sm"
                  >
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
