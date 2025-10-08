import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Volume2 } from "lucide-react";

export const ToneAdjuster = () => {
  const [content, setContent] = useState("");
  const [targetTone, setTargetTone] = useState("professional");
  const [adjustedContent, setAdjustedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAdjust = async () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content to adjust tone.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tone-adjuster', {
        body: { content, targetTone }
      });

      if (error) throw error;

      setAdjustedContent(data.adjustedContent);
      toast({
        title: "Tone Adjusted",
        description: `Content has been rewritten in ${targetTone} tone.`,
      });
    } catch (error) {
      console.error('Error adjusting tone:', error);
      toast({
        title: "Error",
        description: "Failed to adjust tone. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(adjustedContent);
    toast({
      title: "Copied!",
      description: "Adjusted content copied to clipboard.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Tone Adjuster
        </CardTitle>
        <CardDescription>Change content tone to match your needs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter your content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
        />
        
        <Select value={targetTone} onValueChange={setTargetTone}>
          <SelectTrigger>
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="formal">Formal</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="friendly">Friendly</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleAdjust} disabled={loading}>
          {loading ? "Adjusting..." : "Adjust Tone"}
        </Button>

        {adjustedContent && (
          <div className="space-y-2">
            <h4 className="font-semibold">Adjusted Content</h4>
            <Textarea value={adjustedContent} readOnly rows={8} />
            <Button onClick={handleCopy} variant="outline" size="sm">
              Copy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
