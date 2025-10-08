import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";

export const SmartSummarizer = () => {
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content to summarize.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-summarizer', {
        body: { content }
      });

      if (error) throw error;

      setSummary(data.summary);
      toast({
        title: "Summary Created",
        description: "TL;DR summary generated successfully.",
      });
    } catch (error) {
      console.error('Error summarizing content:', error);
      toast({
        title: "Error",
        description: "Failed to create summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast({
      title: "Copied!",
      description: "Summary copied to clipboard.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Smart Summarizer
        </CardTitle>
        <CardDescription>Create TL;DR versions of your content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter long content to summarize..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
        />
        
        <Button onClick={handleSummarize} disabled={loading}>
          {loading ? "Summarizing..." : "Create Summary"}
        </Button>

        {summary && (
          <div className="space-y-2">
            <h4 className="font-semibold">TL;DR Summary</h4>
            <Textarea value={summary} readOnly rows={5} />
            <Button onClick={handleCopy} variant="outline" size="sm">
              Copy
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
