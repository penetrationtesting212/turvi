import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Maximize2 } from "lucide-react";

export const ContentExpander = () => {
  const [content, setContent] = useState("");
  const [expandedContent, setExpandedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExpand = async () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter bullet points or brief content to expand.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('content-expansion', {
        body: { content }
      });

      if (error) throw error;

      setExpandedContent(data.expandedContent);
      toast({
        title: "Content Expanded",
        description: "Your bullet points have been expanded into full paragraphs.",
      });
    } catch (error) {
      console.error('Error expanding content:', error);
      toast({
        title: "Error",
        description: "Failed to expand content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(expandedContent);
    toast({
      title: "Copied!",
      description: "Expanded content copied to clipboard.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Maximize2 className="h-5 w-5" />
          Content Expansion
        </CardTitle>
        <CardDescription>Expand bullet points into full paragraphs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter bullet points or brief notes..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
        />
        
        <Button onClick={handleExpand} disabled={loading}>
          {loading ? "Expanding..." : "Expand Content"}
        </Button>

        {expandedContent && (
          <div className="space-y-2">
            <h4 className="font-semibold">Expanded Content</h4>
            <Textarea value={expandedContent} readOnly rows={10} />
            <Button onClick={handleCopy} variant="outline" size="sm">
              Copy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
