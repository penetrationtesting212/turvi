import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Copy, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SEOResult {
  optimizedContent: string;
  metaTitle: string;
  metaDescription: string;
  suggestedKeywords: string[];
  seoScore: number;
  recommendations: string[];
}

const SEOOptimizer = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [keywords, setKeywords] = useState("");
  const [result, setResult] = useState<SEOResult | null>(null);

  const handleOptimize = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter content to optimize",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimize-seo', {
        body: { content, keywords }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResult(data);

      toast({
        title: "SEO optimization complete!",
        description: `Your content scored ${data.seoScore}/100`,
      });
    } catch (error: any) {
      console.error("Error optimizing SEO:", error);
      toast({
        title: "Optimization failed",
        description: error.message || "Failed to optimize content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Search className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle>SEO Optimizer</CardTitle>
            <CardDescription>Optimize content for search engines</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            placeholder="Paste your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">Target Keywords (comma-separated)</Label>
          <Input
            id="keywords"
            placeholder="e.g., digital marketing, SEO, content strategy"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleOptimize} 
          disabled={loading}
          className="bg-gradient-primary w-full"
        >
          {loading ? "Optimizing..." : "Optimize for SEO"}
        </Button>

        {result && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="font-medium">SEO Score</span>
              </div>
              <Badge variant={result.seoScore >= 80 ? "default" : "secondary"} className="text-lg">
                {result.seoScore}/100
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Meta Title</Label>
                <Button size="sm" variant="outline" onClick={() => handleCopy(result.metaTitle)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Input value={result.metaTitle} readOnly />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Meta Description</Label>
                <Button size="sm" variant="outline" onClick={() => handleCopy(result.metaDescription)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Textarea value={result.metaDescription} readOnly className="min-h-[60px]" />
            </div>

            <div className="space-y-2">
              <Label>Suggested Keywords</Label>
              <div className="flex flex-wrap gap-2">
                {result.suggestedKeywords.map((keyword, i) => (
                  <Badge key={i} variant="outline">{keyword}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recommendations</Label>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {result.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Optimized Content</Label>
                <Button size="sm" variant="outline" onClick={() => handleCopy(result.optimizedContent)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={result.optimizedContent}
                readOnly
                className="min-h-[150px]"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SEOOptimizer;
