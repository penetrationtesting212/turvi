import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ContentRewriter = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [originalContent, setOriginalContent] = useState("");
  const [format, setFormat] = useState("blog");
  const [rewrittenContent, setRewrittenContent] = useState("");

  const handleRewrite = async () => {
    if (!originalContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter content to rewrite",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('rewrite-content', {
        body: { content: originalContent, format }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setRewrittenContent(data.rewrittenContent);

      toast({
        title: "Content rewritten!",
        description: "Your content has been repurposed successfully",
      });
    } catch (error: any) {
      console.error("Error rewriting content:", error);
      toast({
        title: "Rewrite failed",
        description: error.message || "Failed to rewrite content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rewrittenContent);
    toast({
      title: "Copied!",
      description: "Rewritten content copied to clipboard",
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>Content Rewriter</CardTitle>
            <CardDescription>Repurpose content into multiple formats</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="original">Original Content</Label>
          <Textarea
            id="original"
            placeholder="Paste your content here to repurpose it..."
            value={originalContent}
            onChange={(e) => setOriginalContent(e.target.value)}
            className="min-h-[150px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Target Format</Label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="blog">Blog Post</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="landing">Landing Page</SelectItem>
              <SelectItem value="ad">Advertisement</SelectItem>
              <SelectItem value="summary">Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleRewrite} 
          disabled={loading}
          className="bg-gradient-primary w-full"
        >
          {loading ? "Rewriting..." : "Rewrite Content"}
        </Button>

        {rewrittenContent && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <Label>Rewritten Content</Label>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <Textarea
              value={rewrittenContent}
              onChange={(e) => setRewrittenContent(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentRewriter;
